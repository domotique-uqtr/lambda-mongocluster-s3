import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { MongoDBBackupLambda } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new MongoDBBackupLambda(app, 'test');

  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::Lambda::Permission');
  expect(stack).toHaveResource('AWS::IAM::Role');
  expect(stack).toHaveResource('AWS::IAM::Policy');
  expect(stack).toHaveResource('AWS::Events::Rule');
  expect(
    app.synth().getStackArtifact(stack.artifactId).template,
  ).toMatchSnapshot();
});
