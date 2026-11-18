package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntDefectAssignRequest;
import com.huaweicloud.plm.system.dto.IntDefectQuery;
import com.huaweicloud.plm.system.dto.IntDefectSaveRequest;
import com.huaweicloud.plm.system.entity.IntDefect;
import com.huaweicloud.plm.system.mapper.IntDefectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 缺陷服务（N9，DEV-106）。 */
@Service
@RequiredArgsConstructor
public class IntDefectService {

    private static final String DEFAULT_SOURCE = "UAT";
    private static final String DEFAULT_SEVERITY = "MAJOR";
    private static final String DEFAULT_STATUS = "OPEN";
    private static final String STATUS_ASSIGNED = "ASSIGNED";
    private static final String STATUS_CLOSED = "CLOSED";

    private static final String SEVERITY_CRITICAL = "CRITICAL";

    private static final String CONFIG_RESPONSE_HOURS_CRITICAL = "int.defect.sla.response.hours.critical";
    private static final String CONFIG_RESPONSE_HOURS_MAJOR = "int.defect.sla.response.hours.major";
    private static final String CONFIG_RESPONSE_HOURS_MINOR = "int.defect.sla.response.hours.minor";
    private static final String CONFIG_FIX_HOURS_CRITICAL = "int.defect.sla.fix.hours.critical";
    private static final String CONFIG_FIX_HOURS_MAJOR = "int.defect.sla.fix.hours.major";
    private static final String CONFIG_FIX_HOURS_MINOR = "int.defect.sla.fix.hours.minor";

    private static final int DEFAULT_RESPONSE_HOURS_CRITICAL = 2;
    private static final int DEFAULT_RESPONSE_HOURS_MAJOR = 4;
    private static final int DEFAULT_RESPONSE_HOURS_MINOR = 8;
    private static final int DEFAULT_FIX_HOURS_CRITICAL = 24;
    private static final int DEFAULT_FIX_HOURS_MAJOR = 72;
    private static final int DEFAULT_FIX_HOURS_MINOR = 120;
    private static final int FALLBACK_RESPONSE_HOURS = 4;

    private static final String NO_PREFIX = "DEF";

    private final IntDefectMapper intDefectMapper;
    private final IntSupportService intSupport;

    /** 分页查询缺陷。 */
    public PageResult<IntDefect> page(IntDefectQuery query) {
        Page<IntDefect> page = query.toPage();
        intDefectMapper.selectPage(page, Wrappers.<IntDefect>lambdaQuery()
                .eq(StringUtils.hasText(query.getDefectNo()), IntDefect::getDefectNo, query.getDefectNo())
                .eq(StringUtils.hasText(query.getSource()), IntDefect::getSource, query.getSource())
                .eq(StringUtils.hasText(query.getSeverity()), IntDefect::getSeverity, query.getSeverity())
                .eq(StringUtils.hasText(query.getStatus()), IntDefect::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getAssignee()), IntDefect::getAssignee, query.getAssignee())
                .eq(query.getSlaBreached() != null, IntDefect::getSlaBreached, query.getSlaBreached())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntDefect::getDefectNo, query.getKeyword()).or()
                        .like(IntDefect::getTitle, query.getKeyword()).or()
                        .like(IntDefect::getModule, query.getKeyword()))
                .orderByDesc(IntDefect::getId));
        return PageResult.of(page);
    }

    /** 按编号获取缺陷，不存在则抛出业务异常。 */
    public IntDefect require(String defectNo) {
        IntDefect defect = intDefectMapper.selectOne(Wrappers.<IntDefect>lambdaQuery()
                .eq(IntDefect::getDefectNo, defectNo)
                .last("LIMIT 1"));
        if (defect == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "缺陷不存在: " + defectNo);
        }
        return defect;
    }

    /** 创建缺陷，返回缺陷编号。 */
    public String create(IntDefectSaveRequest request) {
        IntDefect defect = new IntDefect();
        defect.setDefectNo(StringUtils.hasText(request.getDefectNo())
                ? request.getDefectNo() : intSupport.nextNo(NO_PREFIX));
        defect.setSource(StringUtils.hasText(request.getSource())
                ? request.getSource() : DEFAULT_SOURCE);
        defect.setSeverity(StringUtils.hasText(request.getSeverity())
                ? request.getSeverity() : DEFAULT_SEVERITY);
        defect.setTitle(request.getTitle());
        defect.setDetail(request.getDetail());
        defect.setModule(request.getModule());
        defect.setFoundAt(request.getFoundAt() == null ? LocalDateTime.now() : request.getFoundAt());
        defect.setSlaResponseHours(request.getSlaResponseHours() == null
                ? resolveResponseHours(defect.getSeverity()) : request.getSlaResponseHours());
        defect.setSlaFixHours(request.getSlaFixHours() == null
                ? resolveFixHours(defect.getSeverity()) : request.getSlaFixHours());
        defect.setStatus(DEFAULT_STATUS);
        defect.setEscalationLevel(0);
        defect.setAssignee(request.getAssignee());
        defect.setSlaBreached(0);
        defect.setRemark(request.getRemark());
        intDefectMapper.insert(defect);
        return defect.getDefectNo();
    }

    /** 更新缺陷。 */
    public void update(String defectNo, IntDefectSaveRequest request) {
        IntDefect defect = require(defectNo);
        if (StringUtils.hasText(request.getDefectNo())) {
            defect.setDefectNo(request.getDefectNo());
        }
        if (StringUtils.hasText(request.getSource())) {
            defect.setSource(request.getSource());
        }
        if (StringUtils.hasText(request.getSeverity())) {
            defect.setSeverity(request.getSeverity());
        }
        defect.setTitle(request.getTitle());
        defect.setDetail(request.getDetail());
        defect.setModule(request.getModule());
        if (request.getFoundAt() != null) {
            defect.setFoundAt(request.getFoundAt());
        }
        if (request.getSlaResponseHours() != null) {
            defect.setSlaResponseHours(request.getSlaResponseHours());
        }
        if (request.getSlaFixHours() != null) {
            defect.setSlaFixHours(request.getSlaFixHours());
        }
        if (StringUtils.hasText(request.getAssignee())) {
            defect.setAssignee(request.getAssignee());
        }
        defect.setRemark(request.getRemark());
        intDefectMapper.updateById(defect);
    }

    /** 删除缺陷。 */
    public void delete(String defectNo) {
        IntDefect defect = require(defectNo);
        intDefectMapper.deleteById(defect.getId());
    }

    /** 分派缺陷，返回更新后的实体。 */
    public IntDefect assign(String defectNo, IntDefectAssignRequest request) {
        IntDefect defect = require(defectNo);
        defect.setAssignee(request.getAssignee());
        defect.setStatus(STATUS_ASSIGNED);
        if (defect.getResponseAt() == null) {
            defect.setResponseAt(LocalDateTime.now());
        }
        if (defect.getFoundAt() != null) {
            int responseHours = defect.getSlaResponseHours() == null
                    ? FALLBACK_RESPONSE_HOURS : defect.getSlaResponseHours();
            LocalDateTime deadline = defect.getFoundAt().plusHours(responseHours);
            if (defect.getResponseAt().isAfter(deadline)) {
                defect.setSlaBreached(1);
            }
        }
        if (request.getRemark() != null) {
            defect.setRemark(request.getRemark());
        }
        intDefectMapper.updateById(defect);
        return defect;
    }

    /** 关闭缺陷，返回更新后的实体。 */
    public IntDefect close(String defectNo) {
        IntDefect defect = require(defectNo);
        defect.setStatus(STATUS_CLOSED);
        if (defect.getFixedAt() == null) {
            defect.setFixedAt(LocalDateTime.now());
        }
        if (defect.getVerifiedAt() == null) {
            defect.setVerifiedAt(LocalDateTime.now());
        }
        intDefectMapper.updateById(defect);
        return defect;
    }

    /** 升级缺陷，返回更新后的实体。 */
    public IntDefect escalate(String defectNo) {
        IntDefect defect = require(defectNo);
        int level = defect.getEscalationLevel() == null ? 0 : defect.getEscalationLevel();
        defect.setEscalationLevel(level + 1);
        defect.setSlaBreached(1);
        intDefectMapper.updateById(defect);
        return defect;
    }

    /** 按严重程度解析 SLA 响应时限配置。 */
    private int resolveResponseHours(String severity) {
        if (SEVERITY_CRITICAL.equalsIgnoreCase(severity)) {
            return intSupport.configInt(CONFIG_RESPONSE_HOURS_CRITICAL, DEFAULT_RESPONSE_HOURS_CRITICAL);
        }
        if (DEFAULT_SEVERITY.equalsIgnoreCase(severity)) {
            return intSupport.configInt(CONFIG_RESPONSE_HOURS_MAJOR, DEFAULT_RESPONSE_HOURS_MAJOR);
        }
        return intSupport.configInt(CONFIG_RESPONSE_HOURS_MINOR, DEFAULT_RESPONSE_HOURS_MINOR);
    }

    /** 按严重程度解析 SLA 修复时限配置。 */
    private int resolveFixHours(String severity) {
        if (SEVERITY_CRITICAL.equalsIgnoreCase(severity)) {
            return intSupport.configInt(CONFIG_FIX_HOURS_CRITICAL, DEFAULT_FIX_HOURS_CRITICAL);
        }
        if (DEFAULT_SEVERITY.equalsIgnoreCase(severity)) {
            return intSupport.configInt(CONFIG_FIX_HOURS_MAJOR, DEFAULT_FIX_HOURS_MAJOR);
        }
        return intSupport.configInt(CONFIG_FIX_HOURS_MINOR, DEFAULT_FIX_HOURS_MINOR);
    }
}
