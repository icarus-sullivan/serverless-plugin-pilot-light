const _ = require('../utils/lodash');
const log = require('../utils/log');
const { DELEGATE_LAMBDA_NAME } = require('../flambe.config');

module.exports = async (ctx) => {
  const rates = Object.keys(ctx.rates);
  
  const credentials = ctx.serverless.providers.aws.getCredentials();
  credentials.region = _.oneOf(ctx, ['options.region', 'serverless.service.provider.region']);

  ctx.serverless.providers.aws.sdk.config.update({ maxRetries: 20 });
  const lambda = new ctx.serverless.providers.aws.sdk.Lambda(credentials);

  const invoke = async (rate) => {
    try {
      await lambda.invoke({
        FunctionName: _.get(ctx, DELEGATE_LAMBDA_NAME),
        InvocationType: 'Event',
        Payload: JSON.stringify({ rate }),
      }).promise();
    } catch (e) {
      console.log('Error igniting resource', e.message);
    }
  }

  log('Igniting sources');
  await Promise.all(rates.map(invoke));
}