set -e

# Set default versions if not overriden by provided env vars
: ${NITRO_CONTRACTS_BRANCH:=$DEFAULT_NITRO_CONTRACTS_VERSION}
: ${TOKEN_BRIDGE_BRANCH:=$DEFAULT_TOKEN_BRIDGE_VERSION}
export NITRO_CONTRACTS_BRANCH
export TOKEN_BRIDGE_BRANCH

echo "Using NITRO_CONTRACTS_BRANCH: $NITRO_CONTRACTS_BRANCH"
echo "Using TOKEN_BRIDGE_BRANCH: $TOKEN_BRIDGE_BRANCH"

mydir=`dirname $0`
cd "$mydir"

if [[ $# -gt 0 ]] && [[ $1 == "script" ]]; then
    shift
    docker compose run scripts "$@"
    exit $?
fi

num_volumes=`docker volume ls --filter label=com.docker.compose.project=dojima-network -q | wc -l`
if [[ $num_volumes -eq 0 ]]; then
    force_init=true
else
    force_init=false
fi

run=true
run_geth=true
run_dojima=true
run_hermes=true
dojima_chain_id=184
geth_chain_id=1337
l2chain=false
devprivkey=cbaf637f5b8c41deaf84f031db1a6230e7e831f3be79c4ed802f0f031d7ace4f
dojima_explorer=false
simple=true


build_node_images=false

geth_config_path="/geth-config"
geth_keystore_path="/geth-keystore"
geth_data_path="/geth-data"

while [[ $# -gt 0 ]]; do
    case $1 in
        --init)
            if ! $force_init; then
                echo == Warning! this will remove all previous data
                read -p "are you sure? [y/n]" -n 1 response
                if [[ $response == "y" ]] || [[ $response == "Y" ]]; then
                    force_init=true
                    build_node_images=true
                    echo
                else
                    exit 0
                fi
            fi
            shift
            ;;
        --init-force)
            force_init=true
            build_node_images=true
            shift
            ;;
        --no-dojima)
            run_dojima=false
            ;;
        --no-geth)
            run_geth=false
            ;;
        --no-hermes)
            run_hermes=false
            ;;
        --l2chain)
            l2chain=true
            ;;
        --dojima-explorer)
            dojima_explorer=true
            ;;
        --simple)
            simple=true
            ;;
        *)
            echo Usage: $0 \[OPTIONS..]
            echo        $0 script [SCRIPT-ARGS]
            echo
            echo OPTIONS:
            echo --init        Initialize the network and remove all previous data
            echo --init-force  Initialize the network and remove all previous data \(without warning\)
            echo --no-dojima   Do not run the dojima node
            echo --no-geth     Do not run the geth node
            echo --no-hermes   Do not run the hermes relayer
            echo --l2chain     Run the L2 chain
            echo --dojima-explorer  Run the dojima explorer
            echo --simple         Run a simple network with dojima chain, hermes and ethere
            echo script runs inside a separate docker. For SCRIPT-ARGS, run $0 script --help
            exit 0
    esac
done

NODES="dojimachain"

if ! $simple; then
    NODES="$NODES hermes"
fi

if $dojima_explorer; then
    NODES="$NODES dojima-explorer"
fi

if $run_geth; then
    NODES="$NODES geth"
fi

if $l2chain; then
    NODES="$NODES l2chain"
fi

echo == Running $NODES

if $force_init; then
    echo == Removing old data..
    docker compose down
    leftoverContainers=`docker container ls -a --filter label=com.docker.compose.project=dojima-network -q | xargs echo`
    if [ `echo $leftoverContainers | wc -w` -gt 0 ]; then
        docker rm $leftoverContainers
    fi

    docker volume prune -f --filter label=com.docker.compose.project=dojima-network
    leftoverVolumes=`docker volume ls --filter label=com.docker.compose.project=dojima-network -q | xargs echo`
    if [ `echo $leftoverVolumes | wc -w` -gt 0 ]; then
        docker volume rm $leftoverVolumes
    fi

    echo == Generating geth keys
    docker compose run scripts write-geth-accounts

    docker compose run --entrypoint sh geth -c "echo passphrase > $geth_data_path/passphrase"
    docker compose run --entrypoint sh geth -c "chown -R 1000:1000 $geth_keystore_path"
    docker compose run --entrypoint sh geth -c "chown -R 1000:1000 $geth_config_path"

    echo == Writing geth genesis config
    docker compose run scripts write-geth-config

    echo == Initializing go-ethereum genesis configuration
    docker compose run geth init --state.scheme hash --datadir $geth_data_path $geth_config_path/geth_genesis.json

    echo == Starting geth
    docker compose up --wait geth
fi
