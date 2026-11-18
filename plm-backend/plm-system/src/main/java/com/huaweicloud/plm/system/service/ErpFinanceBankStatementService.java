package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceBankStatementQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceBankStatementSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceBankStatement;
import com.huaweicloud.plm.system.mapper.ErpFinanceBankStatementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 财务—银行对账单（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 银行对账单登记、分页查询与删除。
 * 对账单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceBankStatementService {

    private static final String DEFAULT_STATEMENT_NO_PREFIX = "FBS";
    private static final String DEFAULT_DIRECTION = "IN";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_MATCH_STATUS = "UNMATCHED";
    private static final String DEFAULT_STATEMENT_STATUS = "IMPORTED";

    private final ErpFinanceBankStatementMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询银行对账单：方向/匹配状态/对账单状态/银行账号精确，对账单号/交易流水号/对方户名模糊，按主键倒序。 */
    public PageResult<ErpFinanceBankStatement> page(ErpFinanceBankStatementQuery query) {
        Page<ErpFinanceBankStatement> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceBankStatement>lambdaQuery()
                .eq(StringUtils.hasText(query.getDirection()),
                        ErpFinanceBankStatement::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getMatchStatus()),
                        ErpFinanceBankStatement::getMatchStatus, query.getMatchStatus())
                .eq(StringUtils.hasText(query.getStatementStatus()),
                        ErpFinanceBankStatement::getStatementStatus, query.getStatementStatus())
                .eq(StringUtils.hasText(query.getBankAccount()),
                        ErpFinanceBankStatement::getBankAccount, query.getBankAccount())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceBankStatement::getStatementNo, query.getKeyword()).or()
                        .like(ErpFinanceBankStatement::getTransactionNo, query.getKeyword()).or()
                        .like(ErpFinanceBankStatement::getCounterpartyName, query.getKeyword()))
                .orderByDesc(ErpFinanceBankStatement::getId));
        return PageResult.of(page);
    }

    public ErpFinanceBankStatement detail(Long id) {
        return require(id);
    }

    /** 新增或更新银行对账单：新增时回填默认方向/金额余额/币种/匹配与对账单状态及组织，对账单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceBankStatementSaveRequest request) {
        ErpFinanceBankStatement entity;
        if (id == null) {
            entity = new ErpFinanceBankStatement();
            entity.setStatementNo(StringUtils.hasText(request.getStatementNo())
                    ? request.getStatementNo() : flowSupport.nextBizNo(DEFAULT_STATEMENT_NO_PREFIX));
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setAmount(request.getAmount() != null
                    ? request.getAmount() : BigDecimal.ZERO);
            entity.setBalance(request.getBalance() != null
                    ? request.getBalance() : BigDecimal.ZERO);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setMatchStatus(StringUtils.hasText(request.getMatchStatus())
                    ? request.getMatchStatus() : DEFAULT_MATCH_STATUS);
            entity.setStatementStatus(StringUtils.hasText(request.getStatementStatus())
                    ? request.getStatementStatus() : DEFAULT_STATEMENT_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除银行对账单：物理删除以释放对账单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceBankStatement require(Long id) {
        ErpFinanceBankStatement entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "银行对账单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceBankStatement entity, ErpFinanceBankStatementSaveRequest request) {
        if (StringUtils.hasText(request.getStatementNo())) {
            entity.setStatementNo(request.getStatementNo());
        }
        if (StringUtils.hasText(request.getBankAccount())) {
            entity.setBankAccount(request.getBankAccount());
        }
        if (StringUtils.hasText(request.getBankName())) {
            entity.setBankName(request.getBankName());
        }
        if (StringUtils.hasText(request.getTransactionNo())) {
            entity.setTransactionNo(request.getTransactionNo());
        }
        if (request.getTransactionDate() != null) {
            entity.setTransactionDate(request.getTransactionDate());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getBalance() != null) {
            entity.setBalance(request.getBalance());
        }
        if (StringUtils.hasText(request.getCounterpartyName())) {
            entity.setCounterpartyName(request.getCounterpartyName());
        }
        if (StringUtils.hasText(request.getCounterpartyAccount())) {
            entity.setCounterpartyAccount(request.getCounterpartyAccount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (StringUtils.hasText(request.getMatchStatus())) {
            entity.setMatchStatus(request.getMatchStatus());
        }
        if (StringUtils.hasText(request.getStatementStatus())) {
            entity.setStatementStatus(request.getStatementStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
