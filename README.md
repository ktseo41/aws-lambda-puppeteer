# serverless framework + aws lambda + puppeteer example code

## Prerequisites

#### aws account

I created a new IAM user and policy

#### [Serverless Framework](www.serverless.com/framework/docs/)

```sh
npm install -g serverless
```

#### serverless-offline

```sh
serverless plugin install -n serverless-offline
```

## Get Started

```sh
npm install
```

### local test

```sh
serverless offline
```

### deploy

```sh
serverless deploy
```

## Dependencies versions

versions of chrome-aws-lambda, puppeteer, and puppeteer-core should be same

## References

-  [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)
-  [aws-node-puppeteer](https://github.com/serverless/examples/tree/v3/aws-node-puppeteer)
-  [automating-og-images-with-aws-lambda](https://scottbartell.com/2019/03/25/automating-og-images-with-aws-lambda/)
-  [Korean - [Node.js] serverless computing with AWS Lambda (feat.puppeteer)](https://sohyun-lee.tistory.com/14)