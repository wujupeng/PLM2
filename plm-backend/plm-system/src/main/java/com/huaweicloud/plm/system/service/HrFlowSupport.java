package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ProcessStartRequest;
import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.mapper.OaProcessDefinitionMapper;
import com.huaweicloud.plm.system.mapper.OaProcessInstanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 行政人事流程单公共支撑：单据编号生成、审批流程发起与撤回、查询日期解析。
 * 单据编号前缀与流程编码均可配置，避免把编码规则写死在代码里。
 */
@Service
@RequiredArgsConstructor
public class HrFlowSupport {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** 秒内序列，避免同一秒内编号冲突。 */
    private static final AtomicInteger SECOND_SEQUENCE = new AtomicInteger(0);

    private final OaProcessDefinitionMapper processMapper;
    private final OaProcessInstanceMapper instanceMapper;
    private final WorkflowEngineService workflowEngineService;
    private final ConfigService configService;

    /** 单据编号：前缀 + 时间戳 + 秒内序列 + 随机数。 */
    public String nextNo(String prefix) {
        int sequence = SECOND_SEQUENCE.updateAndGet(value -> value >= 999 ? 1 : value + 1);
        return prefix + LocalDateTime.now().format(NO_FORMATTER)
                + String.format("%03d", sequence)
                + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }

    /** 单据编号前缀取自可配置项 oa.hr.flow.no.prefix，业务前缀用于区分单据类型。 */
    public String nextFlowNo(String bizPrefix) {
        String base = configService.getValue("oa.hr.flow.no.prefix");
        return nextNo((StringUtils.hasText(base) ? base : "OAHR") + bizPrefix);
    }

    public int configInt(String key, int defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public String configString(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value.trim() : defaultValue;
    }

    public boolean configBoolean(String key, boolean defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.trim());
    }

    /**
     * 发起审批流程：按流程编码查找已发布流程定义，创建流程实例并回写实例信息。
     * 业务标识格式为 {@code BIZ_TYPE:BIZ_ID}，供流程终态事件回写单据状态。
     */
    public OaProcessInstance startFlow(String processCode, String bizType, Long bizId,
                                       String title, String formDataJson) {
        OaProcessDefinition process = processMapper.selectOne(Wrappers.<OaProcessDefinition>lambdaQuery()
                .eq(OaProcessDefinition::getProcessCode, processCode));
        if (process == null) {
            throw new BusinessException("未配置审批流程 " + processCode + "，请联系管理员在流程设计器中维护");
        }
        if (!ProcessDefinitionService.STATUS_PUBLISHED.equals(process.getStatus())) {
            throw new BusinessException("审批流程未发布，无法提交: " + process.getProcessName());
        }
        ProcessStartRequest request = new ProcessStartRequest();
        request.setProcessId(process.getId());
        request.setBusinessKey(bizType + ":" + bizId);
        request.setTitle(title);
        request.setFormDataJson(formDataJson);
        Long instanceId = workflowEngineService.start(request);
        return instanceMapper.selectById(instanceId);
    }

    /** 撤回审批中的流程实例。 */
    public void cancelFlow(Long instanceId) {
        if (instanceId != null) {
            workflowEngineService.cancel(instanceId);
        }
    }

    /** 解析查询起始日期（yyyy-MM-dd）为当日 00:00:00，非法或为空返回 null。 */
    public static LocalDateTime startOfDay(String date) {
        LocalDate parsed = parseDate(date);
        return parsed == null ? null : parsed.atStartOfDay();
    }

    /** 解析查询结束日期（yyyy-MM-dd）为当日 23:59:59，非法或为空返回 null。 */
    public static LocalDateTime endOfDay(String date) {
        LocalDate parsed = parseDate(date);
        return parsed == null ? null : parsed.atTime(23, 59, 59);
    }

    private static LocalDate parseDate(String date) {
        if (!StringUtils.hasText(date)) {
            return null;
        }
        try {
            return LocalDate.parse(date.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
