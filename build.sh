#!/usr/bin/env bash
set -o errexit # Se der ruim, para o script

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
