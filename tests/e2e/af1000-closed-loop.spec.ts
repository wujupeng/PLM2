import { expect, test } from '../../plm-frontend/node_modules/@playwright/test/index.mjs';
import { assertAllowedTarget } from '../helpers/allowed-target.cjs';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    try {
      assertAllowedTarget(route.request().url(), 'browser request');
    } catch {
      await route.abort('blockedbyclient');
      throw new Error('Blocked browser request to a non-whitelisted origin.');
    }
    await route.continue();
  });
});

test('login screen renders Chinese labels in the real UI', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'PLM 系统' })).toBeVisible();
  await expect(page.getByPlaceholder('用户名')).toBeVisible();
  await expect(page.getByPlaceholder('密码')).toBeVisible();
  await expect(page.getByRole('button', { name: /登\s*录/ })).toBeVisible();
});

test('invalid credentials show the server rejection in the real UI', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('用户名').fill(`plm2-invalid-${Date.now()}`);
  await page.getByPlaceholder('密码').fill('invalid-test-only');
  await page.getByRole('button', { name: /登\s*录/ }).click();
  await expect(page.getByText('用户名或密码错误')).toBeVisible();
});

const blockedSteps = [
  ['S01', '管理员创建组织与测试账号', '隔离 dev 环境尚无经系统接口创建的管理员和测试账号。'],
  ['S02', '研发创建 AF1000、多级 BOM 并发布', '依赖 S01 用户及真实 PLM 主数据操作。'],
  ['S03', '销售创建客户和 500 台订单', '依赖已发布产品、客户和销售岗位账号。'],
  ['S04', '销售经理审批订单', '依赖 S03 的真实订单及审批授权。'],
  ['S05', 'OA 邮件通知采购并验证附件', '依赖 S03/S04 订单和可用邮件收件账号。'],
  ['S06', '展开 BOM 并核对毛需/净需', '依赖已发布多级 BOM、库存和真实 MRP 业务单据。'],
  ['S07', '采购申请、询价并生成采购单', '依赖 S06 需求及供应商主数据。'],
  ['S08', '采购金额分级审批', '依赖 S07 的采购单和真实审批流。'],
  ['S09', '采购到货收货', '依赖已审批采购订单。'],
  ['S10', '来料检验及不合格处置', '依赖 S09 的待检批次和质量业务单据。'],
  ['S11', '合格品上架并核对库存流水', '依赖真实检验放行及仓库库位。'],
  ['S12', '创建 500 台生产工单并固化 BOM', '依赖有效物料、BOM、工艺路线及已备料状态。'],
  ['S13', '生产工单领料', '依赖已下达工单和可用库存。'],
  ['S14', '分批报工并核对数量守恒', '依赖真实生产工单、工序和领料结果。'],
  ['S15', '成品检验并生成唯一 SN', '依赖真实完工记录和质量检验。'],
  ['S16', '合格成品入库', '依赖 S15 的真实放行结果。'],
  ['S17', '销售发货并核对库存扣减', '依赖合格成品库存和有效销售订单。'],
  ['S18', '输入 SN 反向追溯供应商和订单', '依赖 S09–S17 建立的全链路实物关系。'],
  ['S19', '财务应收/应付对账', '依赖真实采购、收货、销售及发运凭证。'],
  ['S20', '运营看板与业务凭证对账', '依赖 S01–S19 已真实完成的数据。'],
];

test.describe('AF1000 × 500 real closed-loop scenario', () => {
  for (const [stepId, title, reason] of blockedSteps) {
      test(`${stepId} ${title}`, async () => {
        await test.step(`${stepId} ${title}`, async () => {
          test.skip(true, `BLOCKED: ${reason}`);
        });
      });
    }
  });
