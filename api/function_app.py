import azure.functions as func
import azure.cosmos.cosmos_client as cosmos_client
import os
import json
import logging

app = func.FunctionApp()

@app.route(route="visitor_count", auth_level=func.AuthLevel.ANONYMOUS)
def visitor_count(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing visitor count request.')

    # 1. Connect to Cosmos DB
    connection_string = os.environ['CosmosDbConnectionString']
    client = cosmos_client.CosmosClient.from_connection_string(connection_string)
    database = client.get_database_client("ResumeDB")
    container = client.get_container_client("Counter")

    # 2. Define the item ID (single counter)
    item_id = "visitor-count"
    partition_key = "visitor-count"

    try:
        # 3. Try to read the item
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

@app.route(route="likes", auth_level=func.AuthLevel.ANONYMOUS)
def likes(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing likes request.')

    # 1. Connect to Cosmos DB
    connection_string = os.environ['CosmosDbConnectionString']
    client = cosmos_client.CosmosClient.from_connection_string(connection_string)
    database = client.get_database_client("ResumeDB")
    container = client.get_container_client("Likes")

    # 2. Get the item ID from query params
    item_id = req.params.get('id')
    if not item_id:
        return func.HttpResponse(
            "Please pass an id on the query string",
            status_code=400
        )
    
    partition_key = item_id

    try:
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
            "Internal Server Error",
            status_code=500
        )