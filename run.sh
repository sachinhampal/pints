# TODO: Write a bash script that will update the data and (optionally) start the UI server
#       The following is just a template
#!/bin/bash

# Exit immediately if any command fails
# set -e

# echo "Installing dependencies with uv..."
uv pip install .

# echo "Running data update script..."
uv run --env-file=.env backend/scripts/update_pints_data.py

# echo "Serving static UI from ui/..."
# cd ui
# python3 -m http.server 8000
