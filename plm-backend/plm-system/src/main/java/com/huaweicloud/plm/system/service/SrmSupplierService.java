package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplier;
import com.huaweicloud.plm.system.mapper.SrmSupplierMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商全生命周期—供应商主档（对应 G4-N1，WBS T031）：
 * 供应商主数据登记、分页查询与删除。
 * 供应商编码为必填人工录入，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierService {

    private static final String DEFAULT_SUPPLIER_TYPE = "RAW";
    private static final String DEFAULT_SUPPLIER_STATUS = "PENDING";
    private static final Integer DEFAULT_BLACKLIST_FLAG = 0;

    private final SrmSupplierMapper mapper;

    /** 分页查询供应商主档：供应商类型/供应商状态/等级精确，供应商编码/供应商名称/简称/联系人模糊，按主键倒序。 */
    public PageResult<SrmSupplier> page(SrmSupplierQuery query) {
        Page<SrmSupplier> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplier>lambdaQuery()
                .eq(StringUtils.hasText(query.getSupplierType()),
                        SrmSupplier::getSupplierType, query.getSupplierType())
                .eq(StringUtils.hasText(query.getSupplierStatus()),
                        SrmSupplier::getSupplierStatus, query.getSupplierStatus())
                .eq(StringUtils.hasText(query.getGradeLevel()),
                        SrmSupplier::getGradeLevel, query.getGradeLevel())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplier::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplier::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplier::getShortName, query.getKeyword()).or()
                        .like(SrmSupplier::getContact, query.getKeyword()))
                .orderByDesc(SrmSupplier::getId));
        return PageResult.of(page);
    }

    public SrmSupplier detail(Long id) {
        return require(id);
    }

    /** 新增或更新供应商主档：新增时回填默认供应商类型/供应商状态/黑名单标记与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierSaveRequest request) {
        SrmSupplier entity;
        if (id == null) {
            entity = new SrmSupplier();
            entity.setSupplierType(StringUtils.hasText(request.getSupplierType())
                    ? request.getSupplierType() : DEFAULT_SUPPLIER_TYPE);
            entity.setSupplierStatus(StringUtils.hasText(request.getSupplierStatus())
                    ? request.getSupplierStatus() : DEFAULT_SUPPLIER_STATUS);
            entity.setBlacklistFlag(request.getBlacklistFlag() != null
                    ? request.getBlacklistFlag() : DEFAULT_BLACKLIST_FLAG);
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

    /** 删除供应商主档：物理删除以释放供应商编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplier require(Long id) {
        SrmSupplier entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商主档不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplier entity, SrmSupplierSaveRequest request) {
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getShortName())) {
            entity.setShortName(request.getShortName());
        }
        if (StringUtils.hasText(request.getSupplierType())) {
            entity.setSupplierType(request.getSupplierType());
        }
        if (StringUtils.hasText(request.getUnifiedSocialCode())) {
            entity.setUnifiedSocialCode(request.getUnifiedSocialCode());
        }
        if (StringUtils.hasText(request.getLegalPerson())) {
            entity.setLegalPerson(request.getLegalPerson());
        }
        if (request.getRegisteredCapital() != null) {
            entity.setRegisteredCapital(request.getRegisteredCapital());
        }
        if (StringUtils.hasText(request.getBusinessScope())) {
            entity.setBusinessScope(request.getBusinessScope());
        }
        if (StringUtils.hasText(request.getRegion())) {
            entity.setRegion(request.getRegion());
        }
        if (StringUtils.hasText(request.getIndustry())) {
            entity.setIndustry(request.getIndustry());
        }
        if (StringUtils.hasText(request.getContact())) {
            entity.setContact(request.getContact());
        }
        if (StringUtils.hasText(request.getPhone())) {
            entity.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getEmail())) {
            entity.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getAddress())) {
            entity.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getGradeLevel())) {
            entity.setGradeLevel(request.getGradeLevel());
        }
        if (StringUtils.hasText(request.getSupplierStatus())) {
            entity.setSupplierStatus(request.getSupplierStatus());
        }
        if (request.getBlacklistFlag() != null) {
            entity.setBlacklistFlag(request.getBlacklistFlag());
        }
        if (request.getAdmissionDate() != null) {
            entity.setAdmissionDate(request.getAdmissionDate());
        }
        if (StringUtils.hasText(request.getSource())) {
            entity.setSource(request.getSource());
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
