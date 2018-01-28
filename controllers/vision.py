import time 
import requests
import json
import sys
# Display images within Jupyter

# Variables
_region = 'northeurope' #Here you enter the region of your subscription
_url = 'https://{}.api.cognitive.microsoft.com/vision/v1.0/analyze'.format(_region)
_key = '1beefb49095b479a9d2dd988b4971864' #Here you have to paste your primary key
_maxNumRetries = 10

urlImage = 'https://cdn.shopify.com/s/files/1/1735/5803/products/fidget-spinner-red-min_800x.jpg?v=1501497752'

def processRequest( json, data, headers, params ):
    """
    Helper function to process the request to Project Oxford

    Parameters:
    json: Used when processing images from its URL. See API Documentation
    data: Used when processing image read from disk. See API Documentation
    headers: Used to pass the key information and the data type request
    """

    retries = 0
    result = None

    while True:

        response = requests.request( 'post', _url, json = json, data = data, headers = headers, params = params )

        if response.status_code == 429: 

            print( "Message: %s" % ( response.json() ) )

            if retries <= _maxNumRetries: 
                time.sleep(1) 
                retries += 1
                continue
            else: 
                print( 'Error: failed after retrying!' )
                break

        elif response.status_code == 200 or response.status_code == 201:

            if 'content-length' in response.headers and int(response.headers['content-length']) == 0: 
                result = None 
            elif 'content-type' in response.headers and isinstance(response.headers['content-type'], str): 
                if 'application/json' in response.headers['content-type'].lower(): 
                    result = response.json() if response.content else None 
                elif 'image' in response.headers['content-type'].lower(): 
                    result = response.content
        else:
            print( "Error code: %d" % ( response.status_code ) )
            print( "Message: %s" % ( response.json() ) )

        break
        
    return result

def main():
    # Computer Vision parameters
    params = { 'visualFeatures' : 'Tags'} 

    headers = dict()
    headers['Ocp-Apim-Subscription-Key'] = _key
    headers['Content-Type'] = 'application/json' 

    json = { 'url': sys.argv[1] } 
    #json = { 'url': urlImage }
    data = None

    result = processRequest( json, data, headers, params )
    resultStr = str(result)
    finalResultStr = ""

    for i in range(len(resultStr)):
        #print(resultStr[i]);
        if resultStr[i] == "'":
            finalResultStr += '"'
        else:
            finalResultStr += resultStr[i]

    print(finalResultStr)

if __name__ == '__main__':
  main()
