#!/bin/bash
chown -R node:node /home/node
su node -c "$*"

