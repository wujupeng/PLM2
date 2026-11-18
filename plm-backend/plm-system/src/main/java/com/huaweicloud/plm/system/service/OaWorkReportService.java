package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WorkReportQuery;
import com.huaweicloud.plm.system.dto.WorkReportSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaWorkReport;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaWorkReportMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 协同办公工作汇报服务：日报/周报/月报的维护、已读标记与提交人查询。
 */
@Service
@RequiredArgsConstructor
public class OaWorkReportService {

    public static final String TYPE_DAILY = "DAILY";
    public static final String TYPE_WEEKLY = "WEEKLY";
    public static final String TYPE_MONTHLY = "MONTHLY";

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String NO_PREFIX = "RPT";

    private final OaOaWorkReportMapper reportMapper;
    private final HrFlowSupport flowSupport;
    private final SysUserMapper userMapper;

    /** 工作汇报分页：userId 非空时按提交人过滤，支持类型与关键词。 */
    public PageResult<OaOaWorkReport> page(WorkReportQuery query, Long userId) {
        Page<OaOaWorkReport> page = query.toPage();
        reportMapper.selectPage(page, Wrappers.<OaOaWorkReport>lambdaQuery()
                .eq(userId != null, OaOaWorkReport::getReporterUserId, userId)
                .eq(StringUtils.hasText(query.getReportType()),
                        OaOaWorkReport::getReportType, query.getReportType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaWorkReport::getTitle, query.getKeyword()).or()
                        .like(OaOaWorkReport::getContent, query.getKeyword()))
                .orderByDesc(OaOaWorkReport::getId));
        return PageResult.of(page);
    }

    public OaOaWorkReport requireReport(Long id) {
        OaOaWorkReport report = reportMapper.selectById(id);
        if (report == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工作汇报不存在: " + id);
        }
        return report;
    }

    public OaOaWorkReport detail(Long id) {
        return requireReport(id);
    }

    /** 新建汇报：默认草稿状态与未读，生成编号并以当前用户为提交人。 */
    @Transactional
    public Long create(WorkReportSaveRequest request) {
        OaOaWorkReport report = new OaOaWorkReport();
        applyRequest(report, request);
        report.setReportNo(flowSupport.nextNo(NO_PREFIX));
        Long userId = UserContext.getUserId();
        report.setReporterUserId(userId);
        report.setReporterName(resolveDisplayName(userId));
        report.setReportStatus(STATUS_DRAFT);
        report.setReadFlag(0);
        UserContext.Principal principal = UserContext.get();
        if (principal != null) {
            report.setOrgId(principal.orgId());
        }
        reportMapper.insert(report);
        return report.getId();
    }

    @Transactional
    public void update(Long id, WorkReportSaveRequest request) {
        OaOaWorkReport report = requireReport(id);
        applyRequest(report, request);
        reportMapper.updateById(report);
    }

    /** 标记已读：写入已读标识与已读时间。 */
    @Transactional
    public void markRead(Long id) {
        OaOaWorkReport report = requireReport(id);
        report.setReadFlag(1);
        report.setReadAt(LocalDateTime.now());
        reportMapper.updateById(report);
    }

    @Transactional
    public void delete(Long id) {
        requireReport(id);
        reportMapper.deleteById(id);
    }

    private void applyRequest(OaOaWorkReport report, WorkReportSaveRequest request) {
        report.setReportType(request.getReportType());
        report.setTitle(request.getTitle());
        report.setContent(request.getContent());
        report.setReportDate(request.getReportDate());
        report.setReceiverUserId(request.getReceiverUserId());
        report.setAttachmentJson(request.getAttachmentJson());
        report.setRemark(request.getRemark());
        if (request.getReceiverUserId() != null) {
            report.setReceiverName(resolveDisplayName(request.getReceiverUserId()));
        }
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
