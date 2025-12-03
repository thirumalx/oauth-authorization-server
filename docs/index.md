# OAuth 2 Authorization server

![](img/Oauth2.1%20Authorization%20Server.drawio.png)

## What is OAuth 2?

OAuth means `Open Authorization` & OAuth 2 is an  `Authorization Framework`

#### What is Authentication and Authorization?

`Authentication` - "Who you are?", is the process of ascertaining that somebody really is who they claim to be.

`Authorization` refers to rules that determine who is allowed to do what. E.g. Thirumal may be authorized to create and delete databases, while Jesicca is only authorized to read.

#### [Database](./database.md)


#### There are many ways of authentication, few of which are worth discussing here:

   1. `Knowledge-based authentication`: The username password combination is a type of knowledge-based authentication. The idea is to verify the user based on the knowledge of the user for example answer to security questions, passwords, something which only the user should know.
   
   
   2. `Possession based authentication`: This type of authentication is based on verifying something which a user possesses. For example, when an application sends you One Time Passwords (OTPs) or a text message.

   Modern authentication practices use a combination of both types, also known as `Multi-Factor authentication`.
   
## Prerequisites:

1. [Eureka](https://github.com/m-thirumal/eureka-server) - Optional
2. PostgreSQL 
3. Java 25
4. Redis

### Architecture/Flow:

![Architecture](./img/Architecture.drawio.png)

```
React (Browser)
      |
      |-- 1. GET /auth/login ------------------------------> API Gateway
      |                                                     |
      |                                                     |-- 2. Forward to BFF /auth/login -----> BFF
      |                                                     |                                         |
      |                                                     |                                         |-- 3. Redirect to SAS /authorize ------------------> SAS
      |                                                     |                                         |                                                      |
      |<-- 4. Redirect to SAS ------------------------------|                                         |                                                      |
      |                                                                                               |                                                      |
      |-- 5. User submits login --------------------------------------------------------------------------------------->|-- 5a. Validate user --> PostgreSQL
      |                                                                                                                 |<-- 5b. OK --------------------------|
      |                                                                                                                 |
      |<-- 6. Redirect back with ?code=XYZ <-----------------------------------------------------------------------------|
      |
      |-- 7. GET /auth/callback?code=XYZ ------------------> API Gateway
      |                                                     |
      |                                                     |-- 8. Forward to BFF /auth/callback ---> BFF
      |                                                     |                                         |
      |                                                     |                                         |-- 9. Exchange code for tokens ---------------------> SAS
      |                                                     |                                         |                                                     |
      |                                                     |                                         |<-- 10. Access + Refresh Tokens ---------------------|
      |                                                     |                                         |
      |                                                     |                                         |-- 11. Store tokens in Redis -----------------------> Redis
      |                                                     |                                         |<-- 11a. OK ----------------------------------------|
      |                                                     |                                         |
      |<-- 12. Set Secure HttpOnly session cookie ----------|                                         |
      |
      |                                                                                               |
      |-- 13. GET /api/user --------------------------------> API Gateway
      |                                                     |
      |                                                     |-- 14. Forward to BFF /api/user --------> BFF
      |                                                     |                                         |
      |                                                     |                                         |-- 15. Load session from Redis ---------------------> Redis
      |                                                     |                                         |<-- 15a. Tokens OK ---------------------------------|
      |                                                     |                                         |
      |                                                     |                                         |-- 16. Call Resource Server with Access Token ------------------> Resource Server
      |                                                     |                                         |                                                     |
      |                                                     |                                         |<-- 17. Protected Resource Response -----------------------------|
      |                                                     |                                         |
      |<-- 18. JSON Payload --------------------------------|                                         |
      |
```


## [How to set up](Set up.md)

1. Without [Eureka](https://github.com/m-thirumal/eureka-server). Comment `eureka-client` in `pom.xml`.
2. 




### SQL

```SQL
INSERT INTO public.oauth2_authorization_consent(
	registered_client_id, principal_name, authorities)
	VALUES ('Thirumal', 'admin', 'user');
```

### Database model

![](data-model.svg)

## [FAQ](FAQ.md)


#### Acquire Authorization Code

1. Login using URL: [http://localhost:9000](http://localhost:9000/login)

2. To get Authorization Token: [http://localhost:9000/oauth2/authorize?response_type=code&client_id=client1&redirect_uri=http://127.0.0.1:8000/authorized&scope=read](http://localhost:9000/oauth2/authorize?response_type=code&client_id=client1&redirect_uri=http://127.0.0.1:8000/authorized&scope=read)



