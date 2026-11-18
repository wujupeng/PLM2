package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierRiskQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierRiskSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierRisk;
import com.huaweicloud.plm.system.mapper.SrmSupplierRiskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商风险（对应 SRM 供应商风险管理）：
 * 风险记录登记、分页查询与删除。
 * 风险编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierRiskService {

    private static final String DEFAULT_RISK_NO_PREFIX = "RSK";
    private static final String DEFAULT_RISK_TYPE = "QUALITY";
    private static final String DEFAULT_RISK_LEVEL = "LOW";
    private static final String DEFAULT_RISK_STATUS = "OPEN";

    private final SrmSupplierRiskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询风险记录：风险类型/风险等级/风险状态/供应商编码精确，风险编号/供应商编码/供应商名称/风险来源模糊，按主键倒序。 */
    public PageResult<SrmSupplierRisk> page(SrmSupplierRiskQuery query) {
        Page<SrmSupplierRisk> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierRisk>lambdaQuery()
                .eq(StringUtils.hasText(query.getRiskType()),
                        SrmSupplierRisk::getRiskType, query.getRiskType())
                .eq(StringUtils.hasText(query.getRiskLevel()),
                        SrmSupplierRisk::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getRiskStatus()),
                        SrmSupplierRisk::getRiskStatus, query.getRiskStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierRisk::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierRisk::getRiskNo, query.getKeyword()).or()
                        .like(SrmSupplierRisk::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierRisk::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierRisk::getRiskSource, query.getKeyword()))
                .orderByDesc(SrmSupplierRisk::getId));
        return PageResult.of(page);
    }

    public SrmSupplierRisk detail(Long id) {
        return require(id);
    }

    /** 新增或更新风险记录：新增时回填默认风险类型/等级/状态与组织，风险编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierRiskSaveRequest request) {
        SrmSupplierRisk entity;
        if (id == null) {
            entity = new SrmSupplierRisk();
            entity.setRiskNo(StringUtils.hasText(request.getRiskNo())
                    ? request.getRiskNo() : flowSupport.nextBizNo(DEFAULT_RISK_NO_PREFIX));
            entity.setRiskType(StringUtils.hasText(request.getRiskType())
                    ? request.getRiskType() : DEFAULT_RISK_TYPE);
            entity.setRiskLevel(StringUtils.hasText(request.getRiskLevel())
                    ? request.getRiskLevel() : DEFAULT_RISK_LEVEL);
            entity.setRiskStatus(StringUtils.hasText(request.getRiskStatus())
                    ? request.getRiskStatus() : DEFAULT_RISK_STATUS);
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

    /** 删除风险记录：物理删除以释放风险编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierRisk require(Long id) {
        SrmSupplierRisk entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商风险记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierRisk entity, SrmSupplierRiskSaveRequest request) {
        if (StringUtils.hasText(request.getRiskNo())) {
            entity.setRiskNo(request.getRiskNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getRiskType())) {
            entity.setRiskType(request.getRiskType());
        }
        if (StringUtils.hasText(request.getRiskLevel())) {
            entity.setRiskLevel(request.getRiskLevel());
        }
        if (StringUtils.hasText(request.getRiskSource())) {
            entity.setRiskSource(request.getRiskSource());
        }
        if (StringUtils.hasText(request.getRiskDesc())) {
            entity.setRiskDesc(request.getRiskDesc());
        }
        if (request.getDiscoverDate() != null) {
            entity.setDiscoverDate(request.getDiscoverDate());
        }
        if (StringUtils.hasText(request.getHandleMeasure())) {
            entity.setHandleMeasure(request.getHandleMeasure());
        }
        if (StringUtils.hasText(request.getHandler())) {
            entity.setHandler(request.getHandler());
        }
        if (request.getHandleDate() != null) {
            entity.setHandleDate(request.getHandleDate());
        }
        if (StringUtils.hasText(request.getRiskStatus())) {
            entity.setRiskStatus(request.getRiskStatus());
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
