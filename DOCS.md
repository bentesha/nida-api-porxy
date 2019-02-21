# NIDA API Middleware

### Introducion
This middleware API wraps the original NIDA API and provides an interface that is easier and straightforward to use. Low level implementation details, such as configuring encryption and other difficult-to-handle tasks are abstracted, hence providing you with a cleaner version of the API that is faster and easier to work with.

### Accessing API
The API provides a REST end point running on port `8080`, which can be accessed using `POST` HTTP method as follows:

`POST http://{server-address}:8080/verify-fingerprint`

where `{server-address}` is the address of the hosting server.

### Specifying API Data
The payload data should be a `JSON` object, with three parameters `nin`, `template` and `fingerCode` as follows:

```
{
    "nin": "20 digits NIN number",
    "template": "base 64 encoded WSQ fingerprint template",
    "fingerCode": "R1-5 or L1-5"
}
```

### Example API Call
Below is a complete typical API request

```
POST /verify-fingerprint
{
    "nin": "19011201000123893001",
    "templte": "/6D/pAA6CQcACT....LTJc0ACuCS7/V",
    "fingerCode": "L2"
}
```

#### Params info
|Param|Type|Description|
|---------|---------|-------|
|`nin`|String|Customer 20 digits National (NIDA) ID Number|
|`template`|String|The fingerprint image in WSQ format encoded in base64|
|`fingerCode`|String|Dedotes the finger corresponding to the fingerprint image. `R` being the right and `L` being the left hand. `1` being the thumb and `5` the small finger. E.g `R1` for right thumb, and `L5` for left small finger.

### Handling Response
The server returns HTTP status 200 in all cases, even when verification fails, with additional `JSON` response indicating the result of the request.

The only time a response other than 200 is returned is when the underlying API call fails, in which case, the middleware passes on whatever HTTP status code it received when accessing NIDA gateway to you.

Therefore, a status code othe than 200 should indicate a failure to call the underlying gateway.

Other that that, the response is a `JSON` object in the following format:

```
{
    "code": "00",
    "profile": {
        "firstName": "Alex",
        "lastName": "Samuel",
        ...
    }
}
```

If a fingerprint match is successfull, a `00` code is returned, otherwise `141` is returned if fingerprint match failed. Code `01` indicates a general error.

Parameter `profile` is only present if fingerprint match was successful (i.e when code is '00')


#### Error Codes
|Code|Description|
|-----|------|
|`00`|Fingerprint match was successful|
|`141`|Fingerprint match failed|
|`01`|General error|

#### Complete Response
Below is a complete example response, with all parameters included

> **NOTE** `photo` and `signature` are base64 encoded images


```
{
   "code":"00",
   "profile":{
      "firstName":"ALEX",
      "middleName":"MKUSA",
      "lastName":"KISHIMBI",
      "otherNames":"",
      "sex":"MALE",
      "dateOfBirth":"1901-01-10",
      "placeOfBirth":"",
      "residentRegion":"DODOMA",
      "residentDistrict":"DODOMA CBD",
      "residentWard":"MAKOLE",
      "residentVillage":"Area E",
      "residentStreet":"CHADULU B",
      "residentHouseNo":"PLOT 6 KITALU S BLOCK E",
      "residentPostalAddress":"832 DODOMA",
      "residentPostCode":"41105",
      "birthCountry":"TANZANIA, THE UNITED REPUBLIC",
      "birthRegion":"NJOMBE",
      "birthDistrict":"MAKETE",
      "birthWard":"IWAWA",
      "birthCertificateNo":"",
      "nationality":"TANZANIAN",
      "phoneNumber":"1234 894744",
      "photo":"/9j/4AAQSkZJRgABAQEAYABgAA...CoKTJVgwpMlo//9k=",
      "signature":"/9j/4AAQSkZJRgAB...AFFFFABRRRQB/9k="
   }
}
```