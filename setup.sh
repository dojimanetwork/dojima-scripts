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
run_narada=true
dojima_chain_id=184
geth_chain_id=1337
l2chain=false
devprivkey=cbaf637f5b8c41deaf84f031db1a6230e7e831f3be79c4ed802f0f031d7ace4f
dojima_explorer=false
simple=true

inbound_state_sender=""
span_enable=true

build_node_images=false

# geth paths
geth_config_path="/geth-config"
geth_keystore_path="/geth-keystore"
geth_data_path="/geth-data"

# dojima paths
dojima_config_path="/dojima-config"
dojima_keystore_path="/dojima-keystore"
dojima_data_path="/dojima-data"

# hermes paths
hermes_data="/hermes-data"
hermes_env="./config/.hermes.env"

generate_env() {
    cd scripts
    node index.js "$@"
    cd ..
}


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
            shift
            ;;
        --no-geth)
            run_geth=false
            shift
            ;;
        --no-hermes)
            run_hermes=false
            shift
            ;;
        --no-narada)
            run_narada=false
            shift
            ;;
        --l2chain)
            l2chain=true
            shift
            ;;
        --dojima-explorer)
            dojima_explorer=true
            shift
            ;;
        --simple)
            simple=true
            shift
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

    # remove the config/.hermes.env file if it exists
    if [ -f $hermes_env ]; then
        echo == Removing old hermes env file
        rm $hermes_env
    fi

    if $run_geth; then
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

    if $run_dojima; then
        echo == Generating dojima keys
        docker compose run scripts write-dojima-account

        # Creating volume for dojima chain
        docker compose run --entrypoint sh dojimachain -c "echo password > $dojima_data_path/passphrase"
        docker compose run --entrypoint sh dojimachain -c "chown -R 1000:1000 $dojima_keystore_path"
        docker compose run --entrypoint sh dojimachain -c "chown -R 1000:1000 $dojima_config_path"

        echo == Writing dojima genesis config
        docker compose run scripts write-dojima-config

        echo == Initializing dojima genesis configuration
        docker compose run dojimachain init --state.scheme hash --datadir $dojima_data_path $dojima_config_path/dojima_genesis.json

        echo == Starting dojima
        docker compose up --wait dojimachain
    fi

    if $run_hermes; then
        echo == Generate hermes env
        generate_env write-hermes-env

        echo == Generate dojima env
        generate_env write-dojima-env --dojimaSpanEnable=$span_enable

        if $run_geth; then
            echo == Generate ethereum env
            generate_env write-eth-env --inboundStateSender="0xde2Ea339EBB87acFd621987D008c49947961D3cc"
        fi

        echo == Starting hermes
        docker compose up --wait hermes

        sleep 10
    fi

    if $run_narada; then
        # create a variable to add flags to the narada command
        narada_flags=""
        if $run_dojima; then
            narada_flags="$narada_flags --includeDojChain"
        fi

        if $run_geth; then
            narada_flags="$narada_flags --includeEthChain"
        fi

        echo == Generate narada env
        generate_env write-narada-env $narada_flags

        echo == Starting narada
        docker compose up --wait narada
    fi
fi
