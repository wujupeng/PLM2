package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmCodeStandardQuery;
import com.huaweicloud.plm.system.dto.SysMdmCodeStandardSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmCodeStandard;
import com.huaweicloud.plm.system.mapper.SysMdmCodeStandardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 主数据平台—编码标准（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 编码标准登记、分页查询与删除。
 * 标准编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmCodeStandardService {

    private static final int DEFAULT_SEQ_LENGTH = 4;
    private static final String DEFAULT_RESET_CYCLE = "NONE";
    private static final String DEFAULT_STANDARD_STATUS = "ACTIVE";

    private final SysMdmCodeStandardMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询编码标准：域/重置周期/状态精确，编号/标准编码/名称模糊，按主键倒序。 */
    public PageResult<SysMdmCodeStandard> pageCodeStandards(SysMdmCodeStandardQuery query) {
        Page<SysMdmCodeStandard> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmCodeStandard>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmCodeStandard::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getResetCycle()),
                        SysMdmCodeStandard::getResetCycle, query.getResetCycle())
                .eq(StringUtils.hasText(query.getStandardStatus()),
                        SysMdmCodeStandard::getStandardStatus, query.getStandardStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmCodeStandard::getStandardNo, query.getKeyword()).or()
                        .like(SysMdmCodeStandard::getStandardCode, query.getKeyword()).or()
                        .like(SysMdmCodeStandard::getStandardName, query.getKeyword()))
                .orderByDesc(SysMdmCodeStandard::getId));
        return PageResult.of(page);
    }

    public SysMdmCodeStandard detail(Long id) {
        return require(id);
    }

    /** 新增或更新编码标准：新增时回填默认流水号位数/重置周期/状态与组织，标准编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmCodeStandardSaveRequest request) {
        SysMdmCodeStandard entity;
        if (id == null) {
            entity = new SysMdmCodeStandard();
            entity.setStandardNo(StringUtils.hasText(request.getStandardNo())
                    ? request.getStandardNo() : flowSupport.nextBizNo("MCS"));
            entity.setSeqLength(request.getSeqLength() != null
                    ? request.getSeqLength() : DEFAULT_SEQ_LENGTH);
            entity.setResetCycle(StringUtils.hasText(request.getResetCycle())
                    ? request.getResetCycle() : DEFAULT_RESET_CYCLE);
            entity.setStandardStatus(StringUtils.hasText(request.getStandardStatus())
                    ? request.getStandardStatus() : DEFAULT_STANDARD_STATUS);
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

    /** 删除编码标准：物理删除以释放标准编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmCodeStandard require(Long id) {
        SysMdmCodeStandard entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "编码标准不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmCodeStandard entity, SysMdmCodeStandardSaveRequest request) {
        if (StringUtils.hasText(request.getStandardNo())) {
            entity.setStandardNo(request.getStandardNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getStandardCode())) {
            entity.setStandardCode(request.getStandardCode());
        }
        if (StringUtils.hasText(request.getStandardName())) {
            entity.setStandardName(request.getStandardName());
        }
        if (StringUtils.hasText(request.getCodePattern())) {
            entity.setCodePattern(request.getCodePattern());
        }
        if (request.getSeqLength() != null) {
            entity.setSeqLength(request.getSeqLength());
        }
        if (StringUtils.hasText(request.getResetCycle())) {
            entity.setResetCycle(request.getResetCycle());
        }
        if (StringUtils.hasText(request.getSampleValue())) {
            entity.setSampleValue(request.getSampleValue());
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
