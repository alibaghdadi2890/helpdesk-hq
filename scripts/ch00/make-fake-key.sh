#!/usr/bin/env bash
# Exercise 0.3 · prints a line that looks like a cloud access key, so you can check that
# secret scanning blocks it:
#
#   bash scripts/ch00/make-fake-key.sh > leak-test.txt
#   git add leak-test.txt && git commit -m "leak test"   # gitleaks should refuse
#   rm leak-test.txt
#
# The key is random and belongs to nobody. It is assembled at run time so that this
# repository never contains a key-shaped string itself.
set -eu
prefix="AK""IA"
body=$(LC_ALL=C tr -dc 'A-Z2-7' < /dev/urandom | head -c 16)
secret=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 40)
echo "aws_access_key_id = ${prefix}${body}"
echo "aws_secret_access_key = ${secret}"
