package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmCodeIssueQuery;
import com.huaweicloud.plm.system.dto.SysMdmCodeIssueSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmCodeIssue;
import com.huaweicloud.plm.system.mapper.SysMdmCodeIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 主数据平台—编码发放（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 编码发放登记、分页查询与删除。
 * 编码发放编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmCodeIssueService {

    private static final String DEFAULT_ISSUE_STATUS = "ISSUED";

    private final SysMdmCodeIssueMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询编码发放：域/编码标准/状态精确，编号/主数据编码模糊，按主键倒序。 */
    public PageResult<SysMdmCodeIssue> pageCodeIssues(SysMdmCodeIssueQuery query) {
        Page<SysMdmCodeIssue> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmCodeIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmCodeIssue::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getStandardCode()),
                        SysMdmCodeIssue::getStandardCode, query.getStandardCode())
                .eq(StringUtils.hasText(query.getIssueStatus()),
                        SysMdmCodeIssue::getIssueStatus, query.getIssueStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmCodeIssue::getIssueNo, query.getKeyword()).or()
                        .like(SysMdmCodeIssue::getMasterCode, query.getKeyword()))
                .orderByDesc(SysMdmCodeIssue::getId));
        return PageResult.of(page);
    }

    public SysMdmCodeIssue detail(Long id) {
        return require(id);
    }

    /** 新增或更新编码发放：新增时回填默认状态、组织、发放时间与发放人，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmCodeIssueSaveRequest request) {
        SysMdmCodeIssue entity;
        if (id == null) {
            entity = new SysMdmCodeIssue();
            entity.setIssueNo(StringUtils.hasText(request.getIssueNo())
                    ? request.getIssueNo() : flowSupport.nextBizNo("MCI"));
            entity.setIssueStatus(StringUtils.hasText(request.getIssueStatus())
                    ? request.getIssueStatus() : DEFAULT_ISSUE_STATUS);
            entity.setOrgId(currentOrgId());
            if (request.getIssueTime() == null) {
                entity.setIssueTime(LocalDateTime.now());
            }
            if (!StringUtils.hasText(request.getIssuedBy())) {
                entity.setIssuedBy(currentUserName());
            }
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

    /** 删除编码发放：物理删除以释放编码发放编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmCodeIssue require(Long id) {
        SysMdmCodeIssue entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据编码发放记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null、时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmCodeIssue entity, SysMdmCodeIssueSaveRequest request) {
        if (StringUtils.hasText(request.getIssueNo())) {
            entity.setIssueNo(request.getIssueNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getStandardCode())) {
            entity.setStandardCode(request.getStandardCode());
        }
        if (StringUtils.hasText(request.getMasterCode())) {
            entity.setMasterCode(request.getMasterCode());
        }
        if (request.getSeqValue() != null) {
            entity.setSeqValue(request.getSeqValue());
        }
        if (request.getIssueTime() != null) {
            entity.setIssueTime(request.getIssueTime());
        }
        if (StringUtils.hasText(request.getIssuedBy())) {
            entity.setIssuedBy(request.getIssuedBy());
        }
        if (StringUtils.hasText(request.getIssueStatus())) {
            entity.setIssueStatus(request.getIssueStatus());
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

    private String currentUserName() {
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            return null;
        }
        return StringUtils.hasText(principal.displayName()) ? principal.displayName() : principal.username();
    }
}
