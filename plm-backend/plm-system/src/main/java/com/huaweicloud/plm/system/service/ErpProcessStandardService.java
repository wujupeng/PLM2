package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessStandardQuery;
import com.huaweicloud.plm.system.dto.ErpProcessStandardSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessStandard;
import com.huaweicloud.plm.system.mapper.ErpProcessStandardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—标准工艺（对应 G3-N7b ERP 工艺资源）：
 * 标准工艺登记、分页查询与删除。
 * 标准工艺编码由用户指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessStandardService {

    private static final String DEFAULT_STANDARD_STATUS = "DRAFT";
    private static final String DEFAULT_VERSION_NO = "V1.0";

    private final ErpProcessStandardMapper mapper;

    /** 分页查询标准工艺：标准状态/物料编码精确，标准工艺编码/名称/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpProcessStandard> page(ErpProcessStandardQuery query) {
        Page<ErpProcessStandard> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessStandard>lambdaQuery()
                .eq(StringUtils.hasText(query.getStandardStatus()),
                        ErpProcessStandard::getStandardStatus, query.getStandardStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpProcessStandard::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessStandard::getStandardCode, query.getKeyword()).or()
                        .like(ErpProcessStandard::getStandardName, query.getKeyword()).or()
                        .like(ErpProcessStandard::getMaterialCode, query.getKeyword()).or()
                        .like(ErpProcessStandard::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpProcessStandard::getId));
        return PageResult.of(page);
    }

    public ErpProcessStandard detail(Long id) {
        return require(id);
    }

    /** 新增或更新标准工艺：新增时回填默认标准状态/版本号/工时/工序数与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessStandardSaveRequest request) {
        ErpProcessStandard entity;
        if (id == null) {
            entity = new ErpProcessStandard();
            entity.setStandardStatus(StringUtils.hasText(request.getStandardStatus())
                    ? request.getStandardStatus() : DEFAULT_STANDARD_STATUS);
            entity.setVersionNo(StringUtils.hasText(request.getVersionNo())
                    ? request.getVersionNo() : DEFAULT_VERSION_NO);
            entity.setStandardHours(request.getStandardHours() != null
                    ? request.getStandardHours() : BigDecimal.ZERO);
            entity.setSetupHours(request.getSetupHours() != null
                    ? request.getSetupHours() : BigDecimal.ZERO);
            entity.setOperationCount(request.getOperationCount() != null
                    ? request.getOperationCount() : 0);
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

    /** 删除标准工艺：物理删除以释放标准工艺编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessStandard require(Long id) {
        ErpProcessStandard entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "标准工艺不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessStandard entity, ErpProcessStandardSaveRequest request) {
        if (StringUtils.hasText(request.getStandardCode())) {
            entity.setStandardCode(request.getStandardCode());
        }
        if (StringUtils.hasText(request.getStandardName())) {
            entity.setStandardName(request.getStandardName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getVersionNo())) {
            entity.setVersionNo(request.getVersionNo());
        }
        if (StringUtils.hasText(request.getRouteCode())) {
            entity.setRouteCode(request.getRouteCode());
        }
        if (request.getStandardHours() != null) {
            entity.setStandardHours(request.getStandardHours());
        }
        if (request.getSetupHours() != null) {
            entity.setSetupHours(request.getSetupHours());
        }
        if (request.getOperationCount() != null) {
            entity.setOperationCount(request.getOperationCount());
        }
        if (request.getEffectiveDate() != null) {
            entity.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getStandardStatus())) {
            entity.setStandardStatus(request.getStandardStatus());
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
