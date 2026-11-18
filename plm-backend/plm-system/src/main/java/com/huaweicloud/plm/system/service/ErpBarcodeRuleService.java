package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpBarcodeRuleQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeRuleSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeRule;
import com.huaweicloud.plm.system.mapper.ErpBarcodeRuleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 条码管理—扫码规则（对应 G3-N7a ERP 条码管理）：
 * 扫码规则登记、分页查询与删除。
 * 规则编码由业务指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpBarcodeRuleService {

    private static final String DEFAULT_BARCODE_TYPE = "MATERIAL";
    private static final String DEFAULT_SCAN_BIZ_TYPE = "RECEIPT";
    private static final String DEFAULT_RULE_STATUS = "ACTIVE";

    private final ErpBarcodeRuleMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询扫码规则：条码类型/扫码业务类型/规则状态精确，规则编码/规则名称模糊，按主键倒序。 */
    public PageResult<ErpBarcodeRule> page(ErpBarcodeRuleQuery query) {
        Page<ErpBarcodeRule> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpBarcodeRule>lambdaQuery()
                .eq(StringUtils.hasText(query.getBarcodeType()),
                        ErpBarcodeRule::getBarcodeType, query.getBarcodeType())
                .eq(StringUtils.hasText(query.getScanBizType()),
                        ErpBarcodeRule::getScanBizType, query.getScanBizType())
                .eq(StringUtils.hasText(query.getRuleStatus()),
                        ErpBarcodeRule::getRuleStatus, query.getRuleStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpBarcodeRule::getRuleCode, query.getKeyword()).or()
                        .like(ErpBarcodeRule::getRuleName, query.getKeyword()))
                .orderByDesc(ErpBarcodeRule::getId));
        return PageResult.of(page);
    }

    public ErpBarcodeRule detail(Long id) {
        return require(id);
    }

    /** 新增或更新扫码规则：新增时回填默认条码类型/扫码业务类型/校验与查重开关及状态和组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpBarcodeRuleSaveRequest request) {
        ErpBarcodeRule entity;
        if (id == null) {
            entity = new ErpBarcodeRule();
            entity.setBarcodeType(StringUtils.hasText(request.getBarcodeType())
                    ? request.getBarcodeType() : DEFAULT_BARCODE_TYPE);
            entity.setScanBizType(StringUtils.hasText(request.getScanBizType())
                    ? request.getScanBizType() : DEFAULT_SCAN_BIZ_TYPE);
            entity.setValidateEnabled(request.getValidateEnabled() != null
                    ? request.getValidateEnabled() : 1);
            entity.setDuplicateCheck(request.getDuplicateCheck() != null
                    ? request.getDuplicateCheck() : 1);
            entity.setRuleStatus(StringUtils.hasText(request.getRuleStatus())
                    ? request.getRuleStatus() : DEFAULT_RULE_STATUS);
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

    /** 删除扫码规则：物理删除以释放规则编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpBarcodeRule require(Long id) {
        ErpBarcodeRule entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "扫码规则不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpBarcodeRule entity, ErpBarcodeRuleSaveRequest request) {
        if (StringUtils.hasText(request.getRuleCode())) {
            entity.setRuleCode(request.getRuleCode());
        }
        if (StringUtils.hasText(request.getRuleName())) {
            entity.setRuleName(request.getRuleName());
        }
        if (StringUtils.hasText(request.getBarcodeType())) {
            entity.setBarcodeType(request.getBarcodeType());
        }
        if (StringUtils.hasText(request.getRulePattern())) {
            entity.setRulePattern(request.getRulePattern());
        }
        if (StringUtils.hasText(request.getScanBizType())) {
            entity.setScanBizType(request.getScanBizType());
        }
        if (request.getValidateEnabled() != null) {
            entity.setValidateEnabled(request.getValidateEnabled());
        }
        if (request.getDuplicateCheck() != null) {
            entity.setDuplicateCheck(request.getDuplicateCheck());
        }
        if (StringUtils.hasText(request.getRuleStatus())) {
            entity.setRuleStatus(request.getRuleStatus());
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
