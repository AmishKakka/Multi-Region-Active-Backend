import json
import boto3
import random

image_s3_bucket = boto3.client('s3')
BUCKET = 'large-image-database'

def get_img_files_from_s3_bucket(category):
    try:
        all_files = image_s3_bucket.list_objects_v2(Bucket=BUCKET, Prefix=f'data/{category}')['Contents']
        images = [obj['Key'] for obj in all_files]
        return images
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Error getting object from S3 bucket!'),
            'error': e
        }

def lambda_handler(event, context):
    if event:
        # Handle 'simulation' event 
        if event.get('target') == "any":
            categories = ['cars', 'dogs', 'flowers', 'horses']
            # Randomly pick a category
            category = random.choice(categories)
            images = get_img_files_from_s3_bucket(category)
            if isinstance(images, list):
                # Randomly pick 'x' files from category
                val = random.randint(10, int(event.get('num')))
                num_to_pick = min(val, len(images))
                selected_keys = random.sample(images, num_to_pick)
                return {
                    'statusCode': 200,
                    'num': val
                }
            else:
                return images
        # Handle 'query' event
        else:
            images = get_img_files_from_s3_bucket(event.get('target'))
            if isinstance(images, list):
                # Randomly pick 'num' requested files from 'target' category
                num_to_pick = min(int(event.get('num')), len(images))
                selected_keys = random.sample(images, num_to_pick)

                # Generate Presigned URLs (So frontend can display them)
                results = []
                for key in selected_keys:
                    url = image_s3_bucket.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': BUCKET, 'Key': key},
                            ExpiresIn=900
                    )
                    # print(url)
                    results.append({'key': key, 'url': url})
                return {
                    'statusCode': 200,
                    'target': "any",
                    'img_files': results
                }
            else:
                # print(images)
                return images
    else:
        return {
            'statusCode': 204,
            'body': json.dumps('The variable event is empty :::--> hitting-s3-database!'),
        }