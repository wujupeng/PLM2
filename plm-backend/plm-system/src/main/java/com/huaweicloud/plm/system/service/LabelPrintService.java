package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.LabelPrintLogQuery;
import com.huaweicloud.plm.system.dto.LabelPrintQuery;
import com.huaweicloud.plm.system.dto.LabelPrintRequest;
import com.huaweicloud.plm.system.dto.LabelRenderRequest;
import com.huaweicloud.plm.system.dto.LabelRenderResponse;
import com.huaweicloud.plm.system.dto.LabelReprintRequest;
import com.huaweicloud.plm.system.entity.LabelPrintLog;
import com.huaweicloud.plm.system.entity.LabelPrintTask;
import com.huaweicloud.plm.system.entity.LabelTemplate;
import com.huaweicloud.plm.system.mapper.LabelPrintLogMapper;
import com.huaweicloud.plm.system.mapper.LabelPrintTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 标签打印与补打服务（N5）。
 * <p>
 * 当前实现为「生成打印任务 + 渲染标签内容 + 记录打印日志」；真实打印（驱动/协议）由 sys_config
 * 中 `label.print.driver` / `label.print.mode` 指定的方式接入，待业务方提供后扩展。
 */
@Service
@RequiredArgsConstructor
public class LabelPrintService {

    private static final String DEFAULT_LABEL_TYPE = "CODE24";
    private static final String PRINT_STATUS_SUCCESS = "success";
    private static final String ACTION_PRINT = "PRINT";
    private static final String ACTION_REPRINT = "REPRINT";
    private static final String ACTION_VOID = "VOID";
    private static final String TASK_NO_PREFIX = "LP";
    private static final int TASK_NO_SEQ_LENGTH = 4;
    private static final int MAX_TASK_NO_ATTEMPTS = 3;
    private static final DateTimeFormatter TASK_NO_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final LabelPrintTaskMapper labelPrintTaskMapper;
    private final LabelPrintLogMapper labelPrintLogMapper;
    private final LabelTemplateService labelTemplateService;
    private final ObjectMapper objectMapper;

    public PageResult<LabelPrintTask> page(LabelPrintQuery query) {
        Page<LabelPrintTask> page = query.toPage();
        labelPrintTaskMapper.selectPage(page, Wrappers.<LabelPrintTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), LabelPrintTask::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getTargetCode()), LabelPrintTask::getTargetCode, query.getTargetCode())
                .eq(StringUtils.hasText(query.getSourceCode()), LabelPrintTask::getSourceCode, query.getSourceCode())
                .eq(StringUtils.hasText(query.getProductCode()), LabelPrintTask::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getTemplateCode()), LabelPrintTask::getTemplateCode, query.getTemplateCode())
                .eq(StringUtils.hasText(query.getPrintStatus()), LabelPrintTask::getPrintStatus, query.getPrintStatus())
                .eq(query.getReprintFlag() != null, LabelPrintTask::getReprintFlag, query.getReprintFlag())
                .ge(query.getDateFrom() != null, LabelPrintTask::getPrintAt,
                        query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay())
                .lt(query.getDateTo() != null, LabelPrintTask::getPrintAt,
                        query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay())
                .orderByDesc(LabelPrintTask::getPrintAt));
        return PageResult.of(page);
    }

    public LabelPrintTask detail(Long taskId) {
        return requireTask(taskId);
    }

    public List<LabelPrintLog> listLogsByTask(Long taskId) {
        return labelPrintLogMapper.selectList(Wrappers.<LabelPrintLog>lambdaQuery()
                .eq(LabelPrintLog::getTaskId, taskId)
                .orderByAsc(LabelPrintLog::getId));
    }

    public PageResult<LabelPrintLog> pageLogs(LabelPrintLogQuery query) {
        Page<LabelPrintLog> page = query.toPage();
        labelPrintLogMapper.selectPage(page, Wrappers.<LabelPrintLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), LabelPrintLog::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getTargetCode()), LabelPrintLog::getTargetCode, query.getTargetCode())
                .eq(StringUtils.hasText(query.getActionType()), LabelPrintLog::getActionType, query.getActionType())
                .eq(StringUtils.hasText(query.getResult()), LabelPrintLog::getResult, query.getResult())
                .ge(query.getDateFrom() != null, LabelPrintLog::getPrintAt,
                        query.getDateFrom() == null ? null : query.getDateFrom().atStartOfDay())
                .lt(query.getDateTo() != null, LabelPrintLog::getPrintAt,
                        query.getDateTo() == null ? null : query.getDateTo().plusDays(1).atStartOfDay())
                .orderByDesc(LabelPrintLog::getId));
        return PageResult.of(page);
    }

    @Transactional
    public Long print(LabelPrintRequest request) {
        String labelType = StringUtils.hasText(request.getLabelType()) ? request.getLabelType() : DEFAULT_LABEL_TYPE;
        LabelTemplate template = labelTemplateService.matchTemplate(labelType, request.getTemplateCode());

        LabelRenderRequest renderRequest = new LabelRenderRequest();
        renderRequest.setTemplateCode(template.getTemplateCode());
        renderRequest.setLabelType(labelType);
        renderRequest.setBarcodeContent(request.getTargetCode());
        renderRequest.setFieldValues(request.getFieldValues());
        LabelRenderResponse renderResponse = labelTemplateService.render(renderRequest);

        int qty = request.getQty() == null ? 1 : request.getQty();
        LabelPrintTask task = new LabelPrintTask();
        task.setTemplateId(template.getId());
        task.setTemplateCode(template.getTemplateCode());
        task.setLabelType(labelType);
        task.setSourceCode(request.getSourceCode());
        task.setTargetCode(request.getTargetCode());
        task.setProductCode(request.getProductCode());
        task.setMaterialCode(request.getMaterialCode());
        task.setQty(qty);
        task.setPrintedQty(qty);
        task.setReprintFlag(0);
        task.setPrinterName(request.getPrinterName());
        task.setPrintStatus(PRINT_STATUS_SUCCESS);
        task.setPrintAt(LocalDateTime.now());
        task.setContentText(toJson(renderResponse));
        task.setScanLogId(request.getScanLogId());
        task.setOperatorId(UserContext.getUserId());
        task.setOperatorName(UserContext.getUsername());
        task.setRemark(request.getRemark());
        insertTaskWithRetry(task);

        writeLog(task, ACTION_PRINT, PRINT_STATUS_SUCCESS, "打印成功，数量 " + qty, task.getPrinterName());
        return task.getId();
    }

    @Transactional
    public List<Long> printBatch(List<LabelPrintRequest> requests) {
        if (CollectionUtils.isEmpty(requests)) {
            return Collections.emptyList();
        }
        List<Long> taskIds = new ArrayList<>();
        for (LabelPrintRequest request : requests) {
            taskIds.add(print(request));
        }
        return taskIds;
    }

    @Transactional
    public Long reprint(Long taskId, LabelReprintRequest request) {
        LabelPrintTask origin = requireTask(taskId);
        if (request == null || !StringUtils.hasText(request.getReason())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "补打原因不能为空");
        }
        Integer originQty = origin.getQty() == null ? 1 : origin.getQty();
        int qty = request.getQty() == null ? originQty : request.getQty();

        LabelPrintTask task = new LabelPrintTask();
        task.setTemplateId(origin.getTemplateId());
        task.setTemplateCode(origin.getTemplateCode());
        task.setLabelType(origin.getLabelType());
        task.setSourceCode(origin.getSourceCode());
        task.setTargetCode(origin.getTargetCode());
        task.setProductCode(origin.getProductCode());
        task.setMaterialCode(origin.getMaterialCode());
        task.setQty(qty);
        task.setPrintedQty(qty);
        task.setReprintFlag(1);
        task.setReprintReason(request.getReason());
        task.setOriginTaskNo(origin.getTaskNo());
        task.setPrinterName(StringUtils.hasText(request.getPrinterName())
                ? request.getPrinterName() : origin.getPrinterName());
        task.setPrintStatus(PRINT_STATUS_SUCCESS);
        task.setPrintAt(LocalDateTime.now());
        task.setContentText(origin.getContentText());
        task.setScanLogId(origin.getScanLogId());
        task.setOperatorId(UserContext.getUserId());
        task.setOperatorName(UserContext.getUsername());
        insertTaskWithRetry(task);

        writeLog(task, ACTION_REPRINT, PRINT_STATUS_SUCCESS, "补打成功，原因：" + request.getReason(),
                task.getPrinterName());
        return task.getId();
    }

    @Transactional
    public void voidTask(Long taskId, String reason) {
        LabelPrintTask task = requireTask(taskId);
        String reasonText = StringUtils.hasText(reason) ? reason : "已作废";
        String voidRemark = StringUtils.hasText(reason) ? "已作废：" + reason : "已作废";
        task.setRemark(StringUtils.hasText(task.getRemark())
                ? task.getRemark() + "；" + voidRemark : voidRemark);
        labelPrintTaskMapper.updateById(task);
        writeLog(task, ACTION_VOID, PRINT_STATUS_SUCCESS, reasonText, task.getPrinterName());
    }

    /**
     * 生成任务编号并写入，遇到唯一键冲突时重新生成后重试（最多 {@value #MAX_TASK_NO_ATTEMPTS} 次）。
     */
    private void insertTaskWithRetry(LabelPrintTask task) {
        for (int attempt = 0; attempt < MAX_TASK_NO_ATTEMPTS; attempt++) {
            try {
                task.setTaskNo(generateTaskNo());
                labelPrintTaskMapper.insert(task);
                return;
            } catch (DuplicateKeyException e) {
                // 任务编号冲突，重新生成后重试
            }
        }
        throw new BusinessException(ResultCode.CONFLICT, "标签打印任务编号生成冲突，请稍后重试");
    }

    private String generateTaskNo() {
        String prefix = TASK_NO_PREFIX + LocalDate.now().format(TASK_NO_DATE_FORMAT);
        String maxTaskNo = labelPrintTaskMapper.selectMaxTaskNo(prefix + "%");
        int next = 1;
        if (StringUtils.hasText(maxTaskNo) && maxTaskNo.length() >= TASK_NO_SEQ_LENGTH) {
            String suffix = maxTaskNo.substring(maxTaskNo.length() - TASK_NO_SEQ_LENGTH);
            try {
                next = Integer.parseInt(suffix) + 1;
            } catch (NumberFormatException e) {
                next = 1;
            }
        }
        return prefix + String.format("%0" + TASK_NO_SEQ_LENGTH + "d", next);
    }

    private void writeLog(LabelPrintTask task, String actionType, String result, String message,
                          String printerName) {
        LabelPrintLog log = new LabelPrintLog();
        log.setTaskId(task.getId());
        log.setTaskNo(task.getTaskNo());
        log.setActionType(actionType);
        log.setTargetCode(task.getTargetCode());
        log.setTemplateCode(task.getTemplateCode());
        log.setPrinterName(printerName);
        log.setResult(result);
        log.setMessage(message);
        log.setPrintAt(LocalDateTime.now());
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        labelPrintLogMapper.insert(log);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ResultCode.ERROR, "生成标签打印内容失败: " + e.getMessage());
        }
    }

    private LabelPrintTask requireTask(Long taskId) {
        LabelPrintTask task = labelPrintTaskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "打印任务不存在: " + taskId);
        }
        return task;
    }
}
