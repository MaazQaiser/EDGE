#!/usr/bin/env python3

# primary script to ingest deployment rows into Azure Data Explorer (ADX)
# this script is intended to be run from a CI/CD pipeline, e.g. Bitbucket Pipelines
# it reads environment variables for configuration and command line arguments for deployment details

import os
import sys
import argparse
import pandas as pd
from datetime import datetime, timezone
from azure.kusto.data import KustoConnectionStringBuilder
from azure.kusto.ingest import QueuedIngestClient, IngestionProperties
from azure.kusto.data.data_format import DataFormat

# primary entry point for the script
def main():
    parser = argparse.ArgumentParser(
        description="Ingest a deployment row into ADX from pipeline."
    )
    parser.add_argument('--service-name', required=True, help="Service name for the row")
    parser.add_argument('--version-number', required=True, help="Deployment version string")
    parser.add_argument('--commit-sha', required=True, help="Commit SHA")
    parser.add_argument('--env-name', required=True, help="Environment name (e.g. dev-aen, prd-usc, etc.)")

    args = parser.parse_args()

    # Load ADX config from env
    kusto_cluster = os.environ["ADX_CLUSTER"] # from pipeline variable
    ingest_uri = f"https://ingest-{kusto_cluster}"
    kusto_db = os.environ.get('ADX_DATABASE', 'db-ops')
    kusto_table = os.environ.get('ADX_TABLE', 'deployments')
    client_id = os.environ["AZURE_CLIENT_ID"] # from pipeline variable
    client_secret = os.environ["AZURE_CLIENT_SECRET"] # from pipeline variable
    authority_id = os.environ["AZURE_TENANT_ID"] # from pipeline variable

    print(f"[INFO] Target: {kusto_db}.{kusto_table} @ {kusto_cluster}")

    # build the row to ingest
    time = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    service_name = args.service_name
    version_number = args.version_number
    commit_sha = args.commit_sha
    env_name = args.env_name
    row = {
        "service-name": service_name,
        "value": 1,
        "version-number": version_number,
        "commit": commit_sha,
        "env-name": env_name,
        "timestamp": time,
    }
    df = pd.DataFrame([row])

    print(f"[INFO] Ingesting row: {row}")

    # create the Kusto ingest client
    kusto_connection = KustoConnectionStringBuilder.with_aad_application_key_authentication(ingest_uri, client_id, client_secret, authority_id)
    ingest_client = QueuedIngestClient(kusto_connection)
    ingest_props = IngestionProperties(
        database=kusto_db,
        table=kusto_table,
        data_format=DataFormat.CSV
    )

    print("[INFO] Ingest client created, properties set.")
    print("[VERBOSE] Starting ingestion...")

    try:
        ingest_client.ingest_from_dataframe(df, ingestion_properties=ingest_props)

        print("[SUCCESS] Ingestion submitted (async, may take a few seconds to show up in portal).")
    except Exception as e:
        print("[ERROR] Ingestion failed:", str(e))
        sys.exit(1)

# ensure the script can be run directly
if __name__ == "__main__":
    main()

