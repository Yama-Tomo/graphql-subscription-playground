#!/bin/sh

dirname=$(cd $(dirname $0);pwd)
if [ -z "${GRAPHQL_URL_FOR_CODEGEN}" -a -f ${dirname}/../.env.local ]; then
  set -a
  source ${dirname}/../.env.local
  set +a
  export GRAPHQL_URL_FOR_CODEGEN=${NEXT_PUBLIC_GRAPHQL_URL}
fi

graphql-codegen "$@"
