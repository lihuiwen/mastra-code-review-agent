
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
// import { LibSQLStore } from '@mastra/libsql';

import { weatherAgent } from './agents';
import { codeReviewAgent } from './agents/code-review-agent'
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';

export const mastra = new Mastra({
  agents: { weatherAgent, codeReviewAgent },
  // storage: new LibSQLStore({
  //   // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
  //   url: ":memory:",
  // }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    scope: '55d134a8a38353a0d8fe9340f62f064c',  // 您的Cloudflare账户ID
    projectName: 'mastra-code-review-agent',  // Worker项目名称
    // routes: [
    //   {
    //     pattern: 'api.mastra.cr.lihuiwen.xyz',
    //     zone_name: 'api.mastra.cr.lihuiwen.xyz',
    //     custom_domain: true,
    //   },
    // ],
    compatibility_date: '2025-05-18',
    compatibility_flags: ["nodejs_compat"],
    auth: {
      apiToken: 'xGQt58gUVvLH5SVvJt1cHK5_sGkM7lFzu7jVRMmv',  // Cloudflare API令牌
      apiEmail: 'lihuiwen.mkv@gmail.com',  // Cloudflare电子邮件
    },
  }),
});


