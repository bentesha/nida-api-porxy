# NIDA API Proxy Documentation

**Version:** 1.0

**Date:** 08 June, 2020

**Prepared by:** Benedict Tesha (benedict.tesha@jamaatech.com)

**Company:** Jamaa Technologies Co. Ltd

**URL:** [www.jamaatech.com](http://jamaatech.com)

### 1. Introduction
This document contains information on API's provided by the NIDA gateway proxy for verification of customer information using the fingerprint option and its alternative method for customer with defaced fingerprints or who don't have their fingerprints registered with the NIDA database.

Be sure to replace `<server name>` and `<port>` with the actual values which can be obtained from the Smile Tanzania IT team.

### 2. Normal Fingerprint Verification
For normal fingerprint verifications, an API call must be made to the `fingerprint-verify` end-point with a JSON payload containing customer NIN, finger code and the customer fingerprint WSQ image binary encoded as base64 string as show below:

```
POST http://<server ip>:<port>/fingerprint-verify
```
```json
{
    "nin": "19120527141090000218",
    "fingerCode": "R1",
    "template": "VGh/qJ8LYzAQ4fbm1+pm1PJ/2ppuDr3ypG02NuiXV9g..."
}
```
|Parameter|Description|
|-|-|
|`nin`|Customer NIN|
|`fingerCode`|The code for the finger that is used for this verification. Possible values are `R1` through `R5` for right fingers and `L1` through `L5` for left fingers. Fingers are counted starting with the thumb finger as index 1|
|`template`|The WSQ fingerprint image binary encoded as base64 string|

#### Response
For successful verifications, the response body will contain status code `"00"` and customer information will be contained in the `profile` parameter of the response body as shown below:

```json
{
    "id": "2020060513410083638785829176",
    "code": "00",
    "profile": {
        "firstName": "Joshua",
        "middleName": "Alex",
        "lastName": "Moshi",
        "otherNames": "Buriga",
        "sex": "MALE",
        "dateOfBirth": "1983-06-10",
        "placeOfBirth": "",
        "residentRegion": "DAR ES SALAAM (KINONDONI)",
        "residentDistrict": "KINONDONI",
        "residentWard": "MBEZI JUU",
        "residentVillage": "Mbezi Kati",
        "residentStreet": "Goba Road",
        "residentHouseNo": "KAW/MMJ910",
        "residentPostalAddress": "PO BOX 12345",
        "residentPostalCode": "14445",
        "birthCountry": "TANZANIA, THE UNITED REPUBLIC",
        "birthRegion": "DAR ES SALAAM",
        "birthDistrict": "ILALA",
        "birthWard": "KIVUKONI",
        "birthCertificateNo":"",
        "nationality": "TANZANIAN",
        "phoneNumber": "0799123123",
        "signture": "AFCsMgKSR1A56Vzt94e8DaR8RPDeg6ppkviTXdWtpIDda1etfP...",
        "photo": "Wl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJyt..."
    }
}
```

Other possible status codes are `171` and `141`. Status code `171` indicated the customer is recognised to have defaced fingerprints or does not have fingerprints in the NIDA database. In which case you must switch to use the alternative customer verification API below.
Status code `141` indicates a general fingerprint verification failure. You should try to use a different fingerprint when `141` is returned.

For a full list of all possible error codes, please consult the NIDA API document.

### 2. Alternative Customer Verification
Alternative customer verification API is provided an enabled specifically for customers with fingerprint problems. This generally includes customers with defaced fingerprints and those whose fingerprints have not yet been recorded by NIDA.

Before attempting to use this API, you should first attempt to verify the customer using the normal fingerprint method, and only switch to this API if status code `171` is returned.

This API will verify a customer through a series of questions which must be answered correctly to prove customer identity. Questions can be retrieved and answered in two steps as follows:

#### Step 1: Obtain The First Question
To obtain the first question and initiate a question-answer dialog with NIDA, send a POST request to the `alt-verify` API end-point with a JSON payload containing only the customer NIN as show in the example below:
```
POST http://<server ip>:<port>/alt-verify/
```
```json
{
    "nin": "19120527141090000218"
}
```
The above request will initiate a question/answer dialog in which NIDA will send you a series of random questions. For the customer to be verified, you must answer at least 2 questions correctly. If you exaust all questions and fail to answer the required minimal number of questions, a status code `130` will be returned.

```json
{
  "id": "2020060513410083638785829176",
  "code": "120",
  "result": {
    "questionCode": "111",
    "questionEnglish": "Mention your mother's First name",
    "questionSwahili": "Taja jina la kwanza la mama"
  }
}
```

|Parameter|Description|
|-|-|
|`id`|The ID of the transaction|
|`code`|API response code. `120` indicates the question was loaded successfully. If you reach the end of questions withouth getting at least two questoins correctly, status code `130` will be returned. For other possible codes, please consult NIDA documentation document.
|`questionCode`|The unique code for this particular question. You must provide this code when sending an answer back to NIDA|
|`questionEnglish`|Description of the question in English|
|`questionSwahili`|Description of the question in Swahili|

#### Step 2: Submit an Answer
To sumit an answer to NIDA, you should call the same API endpoint, providing customer NIN, question code and answer as shown below:
```
POST http://<server ip>:<port>/alt-verify
```
```json
{
    "nin": "19120527141090000218",
    "questionCode": "111",
    "answer": "Sarah"
}
```
|Parameter|Description|
|-|-|
|`nin`|Customer NIN|
|`questionCode`|The code of the question returned by NIDA|
|`answer`|The answer to the question|

##### Response
Depending on the number of questions you have successfully answered before and the status of the previous question, the response will be one of the following outcomes:

If the minimum number of correct answers has not been reached and you have not exausted all questions, the response will contain another question, together with the status code for the previous question. If the previous answer was correct, `prevCode` will be set to `123` otherwise it will contain the value `124`.

Below is an example response:
```json
{
  "id": "2020060808545258051296073168",
  "code": "120",
  "result": {
    "prevCode": "124",
    "questionCode": "111",
    "questionEnglish": "Mention your mother's First name",
    "questionSwahili": "Taja jina la kwanza la mama"
  }
}
```
You should repeat step 2 to submit an answer to the new question.

If the minimum number of correct answers has not been reached and you have exausted all questions, the response body will contain status code 130, indicating verification failure.
```json
{
  "id": "2020060808545258051296073168",
  "code": "130"
}
```
If the minimal number of correct answers has been reached, the response will contain customer information in the `result` parameter.

```json
{
  "id": "2020060808545258051296073168",
  "code": "120",
  "result": {
        "firstName": "Joshua",
        "middleName": "Alex",
        "lastName": "Moshi",
        "otherNames": "Buriga",
        "sex": "MALE",
        "dateOfBirth": "1983-06-10",
        "placeOfBirth": "",
        "residentRegion": "DAR ES SALAAM (KINONDONI)",
        "residentDistrict": "KINONDONI",
        "residentWard": "MBEZI JUU",
        "residentVillage": "Mbezi Kati",
        "residentStreet": "Goba Road",
        "residentHouseNo": "KAW/MMJ910",
        "residentPostalAddress": "PO BOX 12345",
        "residentPostalCode": "14445",
        "birthCountry": "TANZANIA, THE UNITED REPUBLIC",
        "birthRegion": "DAR ES SALAAM",
        "birthDistrict": "ILALA",
        "birthWard": "KIVUKONI",
        "birthCertificateNo":"",
        "nationality": "TANZANIAN",
        "phoneNumber": "0799123123",
        "signture": "AFCsMgKSR1A56Vzt94e8DaR8RPDeg6ppkviTXdWtpIDda1etfP...",
        "photo": "Wl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJyt..."
    }
}
```






