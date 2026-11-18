package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierAdmissionQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierAdmissionSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierAdmission;
import com.huaweicloud.plm.system.mapper.SrmSupplierAdmissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商准入：
 * 准入记录登记、分页查询与删除。
 * 准入单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierAdmissionService {

    private static final String DEFAULT_ADMISSION_NO_PREFIX = "ADM";
    private static final String DEFAULT_ADMISSION_TYPE = "NEW";
    private static final String DEFAULT_ADMISSION_STATUS = "DRAFT";

    private final SrmSupplierAdmissionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询准入记录：准入类型/准入状态/供应商编码精确，准入单号/供应商编码/供应商名称/申请人模糊，按主键倒序。 */
    public PageResult<SrmSupplierAdmission> page(SrmSupplierAdmissionQuery query) {
        Page<SrmSupplierAdmission> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierAdmission>lambdaQuery()
                .eq(StringUtils.hasText(query.getAdmissionType()),
                        SrmSupplierAdmission::getAdmissionType, query.getAdmissionType())
                .eq(StringUtils.hasText(query.getAdmissionStatus()),
                        SrmSupplierAdmission::getAdmissionStatus, query.getAdmissionStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierAdmission::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierAdmission::getAdmissionNo, query.getKeyword()).or()
                        .like(SrmSupplierAdmission::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierAdmission::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierAdmission::getApplyBy, query.getKeyword()))
                .orderByDesc(SrmSupplierAdmission::getId));
        return PageResult.of(page);
    }

    public SrmSupplierAdmission detail(Long id) {
        return require(id);
    }

    /** 新增或更新准入记录：新增时回填默认准入类型/准入状态与组织，准入单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierAdmissionSaveRequest request) {
        SrmSupplierAdmission entity;
        if (id == null) {
            entity = new SrmSupplierAdmission();
            entity.setAdmissionNo(StringUtils.hasText(request.getAdmissionNo())
                    ? request.getAdmissionNo() : flowSupport.nextBizNo(DEFAULT_ADMISSION_NO_PREFIX));
            entity.setAdmissionType(StringUtils.hasText(request.getAdmissionType())
                    ? request.getAdmissionType() : DEFAULT_ADMISSION_TYPE);
            entity.setAdmissionStatus(StringUtils.hasText(request.getAdmissionStatus())
                    ? request.getAdmissionStatus() : DEFAULT_ADMISSION_STATUS);
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

    /** 删除准入记录：物理删除以释放准入单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierAdmission require(Long id) {
        SrmSupplierAdmission entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商准入记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierAdmission entity, SrmSupplierAdmissionSaveRequest request) {
        if (StringUtils.hasText(request.getAdmissionNo())) {
            entity.setAdmissionNo(request.getAdmissionNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getAdmissionType())) {
            entity.setAdmissionType(request.getAdmissionType());
        }
        if (StringUtils.hasText(request.getSource())) {
            entity.setSource(request.getSource());
        }
        if (StringUtils.hasText(request.getApplyBy())) {
            entity.setApplyBy(request.getApplyBy());
        }
        if (request.getApplyDate() != null) {
            entity.setApplyDate(request.getApplyDate());
        }
        if (request.getAssessScore() != null) {
            entity.setAssessScore(request.getAssessScore());
        }
        if (StringUtils.hasText(request.getAssessConclusion())) {
            entity.setAssessConclusion(request.getAssessConclusion());
        }
        if (StringUtils.hasText(request.getApprover())) {
            entity.setApprover(request.getApprover());
        }
        if (request.getApproveDate() != null) {
            entity.setApproveDate(request.getApproveDate());
        }
        if (StringUtils.hasText(request.getAdmissionStatus())) {
            entity.setAdmissionStatus(request.getAdmissionStatus());
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
