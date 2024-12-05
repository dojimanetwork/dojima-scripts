FROM node:18-bullseye-slim
WORKDIR /workspace
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    make \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-optional

COPY ./*.ts ./tsconfig.json ./
RUN yarn build
ENTRYPOINT ["node", "index.js"]