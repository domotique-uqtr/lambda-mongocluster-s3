import * as path from 'path';
import * as aws_events from '@aws-cdk/aws-events';
import * as aws_events_targets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

const ENV = 'habilhome';
const TAGS: { [key: string]: string } = {
  Maintainer: 'Guillaume Maka',
  MaintainerEmail: 'guillaume.maka@gmail.com',
  Project: 'ProjetOntario',
  CostCenter: 'Lachapelle',
};

function _addTags(scope: cdk.Construct) {
  for (const tag in TAGS) {
    cdk.Tags.of(scope).add(tag, TAGS[tag]);
  }
}

function _id(id: string): string {
  return `${ENV}/${id}`;
}

function _exportName(exportName: string): string {
  return `${ENV}::${exportName}`;
}
export class MongoDBBackupLambda extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    const fn = new lambda.NodejsFunction(this, _id('MongoDBBackupLambda'), {
      bundling: {
        commandHooks: {
          beforeInstall: (inputDir: string, outputDir: string) => [
            `echo [DEBUG][beforeInstall] inputDir: ${inputDir}, outputDir: ${outputDir}`,
          ],
          afterBundling: (inputDir: string, outputDir: string) => [
            `echo [DEBUG][afterBundling] inputDir: ${inputDir}, outputDir: ${outputDir}`,
          ],
          beforeBundling: (inputDir: string, outputDir: string) => {
            return [
              `echo [DEBUG][beforeBundling] inputDir: ${inputDir}, outputDir: ${outputDir}`,
              `cp ${inputDir}/src/mongodump ${outputDir}`,
            ];
          },
        },
        minify: true,
      },
      entry: path.resolve(__dirname, 'index.js'),
      timeout: cdk.Duration.seconds(120),
      environment: {
        NODE_ENV: 'production',
        MONGODUMP_OPTIONS: `--uri ${cdk.SecretValue.secretsManager(
          'habilhome/prod/MongoDBAtlas',
        )}`,
        S3_BUCKET: cdk.Fn.importValue(_exportName('BucketName')),
        ZIP_FILENAME: 'habilhome-mongodb-backup',
      },
    });

    const s3Bucket = s3.Bucket.fromBucketName(
      this,
      _id('BucketName'),
      cdk.Fn.importValue(_exportName('BucketName')),
    );

    s3Bucket.grantWrite(fn);

    const schedule = aws_events.Schedule.rate(cdk.Duration.days(90));

    new aws_events.Rule(this, _id('MongoDBBackupLambdaRule'), {
      schedule,
      targets: [new aws_events_targets.LambdaFunction(fn)],
    });

    _addTags(this);
  }
}

// for development, use account/region from cdk cli
const env = {
  account:
    process.env.AWS_ACCOUNT_ID ||
    process.env.CDK_DEFAULT_ACOUNT ||
    '650988679566',
  region:
    process.env.AWS_DEFAULT_REGION ||
    // process.env.CDK_DEFAULT_ACOUNT ||
    'ca-central-1', //process.env.AWS_REGION
};

const app = new cdk.App();

new MongoDBBackupLambda(app, 'mongodb-backup-lambda', { env: env });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();
