import azure.functions as func
import azure.cosmos.cosmos_client as cosmos_client
import os
import json
import logging


app = func.FunctionApp()

@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health(req: func.HttpRequest) -> func.HttpResponse:
    """Diagnostic endpoint to check Cosmos DB connectivity"""
    try:
        connection_string = os.environ.get('CosmosDbConnectionString')
        if not connection_string:
            return func.HttpResponse(
                json.dumps({"status": "error", "message": "CosmosDbConnectionString not set"}),
                status_code=500,
                mimetype="application/json"
            )
        
        client = cosmos_client.CosmosClient.from_connection_string(connection_string)
        database = client.get_database_client("ResumeDB")
        
        # Check if containers exist
        containers = list(database.list_containers())
        container_names = [c['id'] for c in containers]
        
        return func.HttpResponse(
            json.dumps({
                "status": "ok",
                "database": "ResumeDB",
                "containers": container_names,
                "connection": "successful"
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"status": "error", "message": str(e), "type": type(e).__name__}),
            status_code=500,
            mimetype="application/json"
        )


@app.route(route="visitor_count", auth_level=func.AuthLevel.ANONYMOUS)
def visitor_count(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing visitor count request.')

    try:
        # 1. Connect to Cosmos DB
        connection_string = os.environ.get('CosmosDbConnectionString')
        if not connection_string:
            raise ValueError("CosmosDbConnectionString environment variable is not set.")

        client = cosmos_client.CosmosClient.from_connection_string(connection_string)
        database = client.get_database_client("ResumeDB")
        container = database.get_container_client("Counter")

        # 2. Define the item ID (single counter)
        item_id = "visitor-count"
        partition_key = "visitor-count"

        # 3. Try to read the item
        try:
            item = container.read_item(item=item_id, partition_key=partition_key)
            # 4. Increment
            item['count'] += 1
            container.upsert_item(item)
            count = item['count']
        except Exception:
            # 5. If item doesn't exist, create it
            item = {'id': item_id, 'count': 1}
            container.create_item(item)
            count = 1

        return func.HttpResponse(
            json.dumps({"count": count}),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        logging.error(f"Error in visitor_count: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="likes", auth_level=func.AuthLevel.ANONYMOUS)
def likes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing likes request.')

    try:
        # 1. Connect to Cosmos DB
        connection_string = os.environ.get('CosmosDbConnectionString')
        if not connection_string:
            raise ValueError("CosmosDbConnectionString environment variable is not set.")

        client = cosmos_client.CosmosClient.from_connection_string(connection_string)
        database = client.get_database_client("ResumeDB")
        container = database.get_container_client("Likes")

        # 2. Get the item ID from query params
        item_id = req.params.get('id')
        if not item_id:
            return func.HttpResponse(
                "Please pass an id on the query string",
                status_code=400
            )
        
        partition_key = item_id

        if req.method == 'GET':
            # Fetch likes
            try:
                item = container.read_item(item=item_id, partition_key=partition_key)
                count = item['count']
            except Exception:
                count = 0
            
            return func.HttpResponse(
                json.dumps({"likes": count}),
                mimetype="application/json",
                status_code=200
            )

        elif req.method == 'POST':
            # Increment likes
            try:
                item = container.read_item(item=item_id, partition_key=partition_key)
                item['count'] += 1
                container.upsert_item(item)
                count = item['count']
            except Exception:
                # Create if doesn't exist
                item = {'id': item_id, 'count': 1}
                container.create_item(item)
                count = 1

            return func.HttpResponse(
                json.dumps({"likes": count}),
                mimetype="application/json",
                status_code=200
            )

    except Exception as e:
        logging.error(f"Error processing likes: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )