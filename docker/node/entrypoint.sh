#!/bin/sh
set -eu

container_user=node
current_uid=$(id -u ${container_user})
current_gid=$(id -g ${container_user})

if [ ${current_uid} -ne ${CONTAINER_USER_UID} -o ${current_gid} -ne ${CONTAINER_USER_GID} ]; then
  groupmod -g $CONTAINER_USER_GID ${container_user}
  usermod -u $CONTAINER_USER_UID ${container_user}
fi

su-exec ${container_user} "$@"
