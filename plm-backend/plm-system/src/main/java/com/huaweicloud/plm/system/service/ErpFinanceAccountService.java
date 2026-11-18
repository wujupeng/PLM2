package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceAccountQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceAccountSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceAccount;
import com.huaweicloud.plm.system.mapper.ErpFinanceAccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 财务—会计科目（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 会计科目登记、分页查询与删除。
 * 科目编码由用户指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceAccountService {

    private static final String DEFAULT_ACCOUNT_TYPE = "ASSET";
    private static final String DEFAULT_BALANCE_DIRECTION = "DEBIT";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final String DEFAULT_ACCOUNT_STATUS = "ACTIVE";

    private final ErpFinanceAccountMapper mapper;

    /** 分页查询会计科目：科目类型/状态/上级编码精确，科目编码/名称模糊，按主键倒序。 */
    public PageResult<ErpFinanceAccount> page(ErpFinanceAccountQuery query) {
        Page<ErpFinanceAccount> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceAccount>lambdaQuery()
                .eq(StringUtils.hasText(query.getAccountType()),
                        ErpFinanceAccount::getAccountType, query.getAccountType())
                .eq(StringUtils.hasText(query.getAccountStatus()),
                        ErpFinanceAccount::getAccountStatus, query.getAccountStatus())
                .eq(StringUtils.hasText(query.getParentCode()),
                        ErpFinanceAccount::getParentCode, query.getParentCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceAccount::getAccountCode, query.getKeyword()).or()
                        .like(ErpFinanceAccount::getAccountName, query.getKeyword()))
                .orderByDesc(ErpFinanceAccount::getId));
        return PageResult.of(page);
    }

    public ErpFinanceAccount detail(Long id) {
        return require(id);
    }

    /** 新增或更新会计科目：新增时回填默认类型/余额方向/层级/末级/币种与状态及组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpFinanceAccountSaveRequest request) {
        ErpFinanceAccount entity;
        if (id == null) {
            entity = new ErpFinanceAccount();
            entity.setAccountType(StringUtils.hasText(request.getAccountType())
                    ? request.getAccountType() : DEFAULT_ACCOUNT_TYPE);
            entity.setBalanceDirection(StringUtils.hasText(request.getBalanceDirection())
                    ? request.getBalanceDirection() : DEFAULT_BALANCE_DIRECTION);
            entity.setLevelNo(request.getLevelNo() != null ? request.getLevelNo() : 1);
            entity.setIsLeaf(request.getIsLeaf() != null ? request.getIsLeaf() : 1);
            entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                    ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
            entity.setAccountStatus(StringUtils.hasText(request.getAccountStatus())
                    ? request.getAccountStatus() : DEFAULT_ACCOUNT_STATUS);
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

    /** 删除会计科目：物理删除以释放科目编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpFinanceAccount require(Long id) {
        ErpFinanceAccount entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "会计科目不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpFinanceAccount entity, ErpFinanceAccountSaveRequest request) {
        if (StringUtils.hasText(request.getAccountCode())) {
            entity.setAccountCode(request.getAccountCode());
        }
        if (StringUtils.hasText(request.getAccountName())) {
            entity.setAccountName(request.getAccountName());
        }
        if (StringUtils.hasText(request.getAccountType())) {
            entity.setAccountType(request.getAccountType());
        }
        if (StringUtils.hasText(request.getBalanceDirection())) {
            entity.setBalanceDirection(request.getBalanceDirection());
        }
        if (StringUtils.hasText(request.getParentCode())) {
            entity.setParentCode(request.getParentCode());
        }
        if (request.getLevelNo() != null) {
            entity.setLevelNo(request.getLevelNo());
        }
        if (request.getIsLeaf() != null) {
            entity.setIsLeaf(request.getIsLeaf());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            entity.setCurrencyCode(request.getCurrencyCode());
        }
        if (StringUtils.hasText(request.getAccountStatus())) {
            entity.setAccountStatus(request.getAccountStatus());
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
