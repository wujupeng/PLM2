package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntSecurityIssueFixRequest;
import com.huaweicloud.plm.system.dto.IntSecurityIssueQuery;
import com.huaweicloud.plm.system.dto.IntSecurityIssueSaveRequest;
import com.huaweicloud.plm.system.entity.IntSecurityIssue;
import com.huaweicloud.plm.system.mapper.IntSecurityIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 安全问题服务（N9，DEV-102）。 */
@Service
@RequiredArgsConstructor
public class IntSecurityIssueService {

    private static final String DEFAULT_SEVERITY = "MEDIUM";
    private static final String DEFAULT_STATUS = "OPEN";
    private static final String STATUS_FIXED = "FIXED";
    private static final String STATUS_VERIFIED = "VERIFIED";
    private static final String NO_PREFIX = "SEC";

    private final IntSecurityIssueMapper intSecurityIssueMapper;
    private final IntSupportService intSupport;

    /** 分页查询安全问题。 */
    public PageResult<IntSecurityIssue> page(IntSecurityIssueQuery query) {
        Page<IntSecurityIssue> page = query.toPage();
        intSecurityIssueMapper.selectPage(page, Wrappers.<IntSecurityIssue>lambdaQuery()
                .eq(StringUtils.hasText(query.getIssueNo()), IntSecurityIssue::getIssueNo, query.getIssueNo())
                .eq(StringUtils.hasText(query.getCategory()), IntSecurityIssue::getCategory, query.getCategory())
                .eq(StringUtils.hasText(query.getSeverity()), IntSecurityIssue::getSeverity, query.getSeverity())
                .eq(StringUtils.hasText(query.getStatus()), IntSecurityIssue::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntSecurityIssue::getIssueNo, query.getKeyword()).or()
                        .like(IntSecurityIssue::getTitle, query.getKeyword()))
                .orderByDesc(IntSecurityIssue::getId));
        return PageResult.of(page);
    }

    /** 按编号获取安全问题，不存在则抛出业务异常。 */
    public IntSecurityIssue require(String issueNo) {
        IntSecurityIssue issue = intSecurityIssueMapper.selectOne(Wrappers.<IntSecurityIssue>lambdaQuery()
                .eq(IntSecurityIssue::getIssueNo, issueNo)
                .last("LIMIT 1"));
        if (issue == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "安全问题不存在: " + issueNo);
        }
        return issue;
    }

    /** 创建安全问题，返回问题编号。 */
    public String create(IntSecurityIssueSaveRequest request) {
        IntSecurityIssue issue = new IntSecurityIssue();
        issue.setIssueNo(StringUtils.hasText(request.getIssueNo())
                ? request.getIssueNo() : intSupport.nextNo(NO_PREFIX));
        issue.setCategory(request.getCategory());
        issue.setSeverity(StringUtils.hasText(request.getSeverity())
                ? request.getSeverity() : DEFAULT_SEVERITY);
        issue.setTitle(request.getTitle());
        issue.setDetail(request.getDetail());
        issue.setDiscoveredBy(StringUtils.hasText(request.getDiscoveredBy())
                ? request.getDiscoveredBy() : UserContext.getUsername());
        issue.setDiscoveredAt(LocalDateTime.now());
        issue.setStatus(DEFAULT_STATUS);
        issue.setRemark(request.getRemark());
        intSecurityIssueMapper.insert(issue);
        return issue.getIssueNo();
    }

    /** 更新安全问题。 */
    public void update(String issueNo, IntSecurityIssueSaveRequest request) {
        IntSecurityIssue issue = require(issueNo);
        if (StringUtils.hasText(request.getIssueNo())) {
            issue.setIssueNo(request.getIssueNo());
        }
        issue.setCategory(request.getCategory());
        if (StringUtils.hasText(request.getSeverity())) {
            issue.setSeverity(request.getSeverity());
        }
        issue.setTitle(request.getTitle());
        issue.setDetail(request.getDetail());
        if (StringUtils.hasText(request.getDiscoveredBy())) {
            issue.setDiscoveredBy(request.getDiscoveredBy());
        }
        issue.setRemark(request.getRemark());
        intSecurityIssueMapper.updateById(issue);
    }

    /** 删除安全问题。 */
    public void delete(String issueNo) {
        IntSecurityIssue issue = require(issueNo);
        intSecurityIssueMapper.deleteById(issue.getId());
    }

    /** 整改安全问题，返回更新后的实体。 */
    public IntSecurityIssue fix(String issueNo, IntSecurityIssueFixRequest request) {
        IntSecurityIssue issue = require(issueNo);
        if (request != null && StringUtils.hasText(request.getFixPlan())) {
            issue.setFixPlan(request.getFixPlan());
        }
        String status = request == null ? null : request.getStatus();
        issue.setStatus(StringUtils.hasText(status) ? status : STATUS_FIXED);
        if (STATUS_FIXED.equals(issue.getStatus())) {
            issue.setFixedAt(LocalDateTime.now());
        }
        intSecurityIssueMapper.updateById(issue);
        return issue;
    }

    /** 验证安全问题，返回更新后的实体。 */
    public IntSecurityIssue verify(String issueNo) {
        IntSecurityIssue issue = require(issueNo);
        issue.setStatus(STATUS_VERIFIED);
        issue.setVerifier(UserContext.getUsername());
        issue.setVerifiedAt(LocalDateTime.now());
        intSecurityIssueMapper.updateById(issue);
        return issue;
    }
}
