# NIDA API Proxy Documentation (v1.2)

**Revision History**

|Date|Version|Comments|
|--|--|--|
|17 July, 2020|v1.2|CCID and registration type parameters added to additional SIM API|
|23 June, 2020|v1.1|Additional SIM Card API|
|08 June, 2020|v1.0|Initial version|

**Prepared by:** Benedict Tesha (benedict.tesha@jamaatech.com)

**Company:** Jamaa Technologies Co. Ltd

**URL:** [www.jamaatech.com](http://jamaatech.com)

### 1. Introduction
This document contains information on API's provided by the NIDA gateway proxy for verification of customer information using the fingerprint option and its alternative method for customer with defaced fingerprints or who don't have their fingerprints registered with the NIDA database.

Revision 1.1 of this document covers the `additional SIM Card` API as per TCRA requirements.

Be sure to replace `<server name>` and `<port>` with the actual values which should be obtained from the Smile Tanzania IT team.

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

### 3. Additional SIM Card
For every customer that need to register an additional SIM card, authorization from TCRA must be requested thorough this API before SIM registration process can take place.

#### Request
The request should be sent to `/additionalSIMCard` end point with a payload containing customer and agent information as shown in example below:

```
POST http://<server ip>:<port>/additionalSIMCard
```

```json
{
  "agentCode": "123",
  "agentNIN": "12345678901234567890",
  "agentMSISDN": "255123456789",
  "conversationId": "39938333",
  "customerMSISDN": "255987654321",
  "iccid": "83626755439871126",
  "customerNIN": "09876543211234567890",
  "reasonCode": "1006",
  "registrationCategoryCode": "2000",
  "registrationType": "Existing",
  "otherNumbers": []
}
```

Description for each parameter is shown in the following table:

|Parameter|Description|
|---|---|
|`agentCode`|A unique code assigned to the agent|
|`agentNIN`|NIN of the agent|
|`agentMSISDN`|A twelve digit agent MSISDN|
|`coversationId`|A random string that uniquely identifies this request that should be stored and used as reference in the future|
|`customerMSISDN`|A twelve digig customer MSISDN|
|`iccid`|ICCID to be associated with customer SIM|
|`customerNIN`|A 20 digit customer NIN|
|`reasonCode`|A code indicating the reason for additional SIM Card as agreen between MNO and TCRA|
|`registrationCategoryCode`|The code indicating category for this registration as specified by TCRA|
|`registrationType`|Type of registration. Valid values are either `New` or `Existing`|
|`otherNumbers`|For corporate customers with existing SIM cards registered with them, this array should be populated with all existing SIM cards. Each entry should be a 12 digit MSISDN. For non-corporate customers, an empty array should be supplied instead.|

#### Response
Unless there is an system error, the HTTP status code is always 200. The response is a JSON payload with he following format:

```json
{
  "conversationId": "111-2345-55688",
  "responseCode": "150",
  "responseDescription": "Approved",
  "timestamp": "20200622171244",
  "transactionId": "20200622171244-00002-1592835164157"
}
```

|Parameter|Description|
|---|---|
|`conversationId`|The id of this conversation as specifed in the original request|
|`responseCode`|Code indicating the outcome of the additional SIM request|
|`responseDescription`|Description for the `responseCode`|
|`timestamp`|Timestamp for this response in the `YYYYMMDDHHmmss` format|
|`transactionId`|A unique id that can be used to reference this transaction in the future|

The `responseCode` parameter can be one of the following values:

|Code|Description|
|---|---|
|`999`|Invalid authentication|
|`150`|Approved|
|`151`|Rejected. Customer NIN blacklisted|
|`152`|Rejected. Agent NIN blacklisted|
|`153`|Rejected. Customer reached max allowed SIM cards|
|`154`|Rejected. Customer reason to have addtional SIM card not accepted|
|`155`|Rejected. The registration category is incorrect|
|`000`|Rejected. Request submitted with null parameter(s)|
