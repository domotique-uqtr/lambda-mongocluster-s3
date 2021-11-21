const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.133.0',
  defaultReleaseBranch: 'main',
  name: 'mongodb-backup-lambda',

  cdkDependencies: [
    '@aws-cdk/aws-lambda-event-sources',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-servicediscovery',
    '@aws-cdk/aws-sqs',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
  ] /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */,
  // deps: [],                          /* Runtime dependencies of this module. */
  // description: undefined,            /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'esbuild',
    'archiver@5.0.0',
    'dayjs@1.8.34',
  ] /* Build dependencies for this module. */,
  // packageName: undefined,            /* The "name" in package.json. */
  // projectType: ProjectType.UNKNOWN,  /* Which type of project this is (library/app). */
  // release: undefined,                /* Add release management to this project. */
});
project.synth();
