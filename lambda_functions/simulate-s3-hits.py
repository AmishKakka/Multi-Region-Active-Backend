import json
import boto3
import time

# Initialize Lambda Client
l_event = boto3.client('lambda')


def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
    except:
        print("Error parsing request body") 

    # Input request if "query" mode
    if body.get('mode') == "query":
        input  = {
            "target": body.get('target'),
            "num": body.get('num')
        }
    # Input request if "simulation" mode
    elif body.get('mode') == "simulation":
        input = {
            "target": "any",
            "num": body.get('num')
        }
    
    st = time.time()
    response = l_event.invoke(
        FunctionName='your-lambda-function-name',  # Replace with your Lambda function name
        Payload=json.dumps(input)
    )
    et = time.time()

    if body.get('mode') == "query":
        responsePayload = json.loads(response['Payload'].read().decode('utf-8'))
        print(response['Payload'].read().decode('utf-8'))
        if response['StatusCode'] == 200:
            return {
                'statusCode': response['StatusCode'],
                'body': json.dumps({
                    'message': 'Query Successful',
                    'response': responsePayload,
                    'latency': et - st
                })
            }
        else:
            return {
                'statusCode': response['StatusCode'],
                'body': json.dumps({
                    'message': 'Internal Server Error'
                })
            }
    elif body.get('mode') == "simulation":
        responsePayload = json.loads(response['Payload'].read().decode('utf-8'))
        print(response['Payload'].read().decode('utf-8'))

        if response['StatusCode'] == 200:    
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'response': responsePayload,
                    'latency': et - st
                })
            }
        else:
            return {
                'statusCode': response['StatusCode'],
                'body': json.dumps({
                    'message': 'Internal Server Error'
                })
            }