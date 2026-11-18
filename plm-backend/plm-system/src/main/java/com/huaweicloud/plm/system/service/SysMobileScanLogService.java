package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.LabelValidateResult;
import com.huaweicloud.plm.system.dto.MobileScanLogQuery;
import com.huaweicloud.plm.system.dto.MobileScanLogSaveRequest;
import com.huaweicloud.plm.system.dto.MobileScanRequest;
import com.huaweicloud.plm.system.dto.MobileScanResult;
import com.huaweicloud.plm.system.entity.SysMobileScanLog;
import com.huaweicloud.plm.system.mapper.SysMobileScanLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 扫码操作日志（G1-N6 公共平台底座—通用能力 WBS T106 移动端与PDA）：
 * 扫码动作记录、分页查询与删除，并提供扫码入口 {@link #recordScan}：
 * 先做标签校验，再写扫码日志，校验失败时自动入队移动异常。
 * 日志编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMobileScanLogService {

    private static final String RESULT_SUCCESS = "SUCCESS";
    private static final String RESULT_FAIL = "FAIL";
    private static final String ERROR_TYPE_LABEL_INVALID = "LABEL_INVALID";

    private final SysMobileScanLogMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final SysLabelRuleService labelRuleService;
    private final SysMobileExceptionService exceptionService;

    /** 分页查询扫码日志：场景编码/扫码类型/扫码结果/设备编号精确，条码模糊，时间区间作用于扫码时间。 */
    public PageResult<SysMobileScanLog> pageScanLogs(MobileScanLogQuery query) {
        Page<SysMobileScanLog> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMobileScanLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getSceneCode()),
                        SysMobileScanLog::getSceneCode, query.getSceneCode())
                .eq(StringUtils.hasText(query.getScanType()),
                        SysMobileScanLog::getScanType, query.getScanType())
                .eq(StringUtils.hasText(query.getScanResult()),
                        SysMobileScanLog::getScanResult, query.getScanResult())
                .eq(StringUtils.hasText(query.getDeviceNo()),
                        SysMobileScanLog::getDeviceNo, query.getDeviceNo())
                .like(StringUtils.hasText(query.getBarcode()),
                        SysMobileScanLog::getBarcode, query.getBarcode())
                .ge(StringUtils.hasText(query.getStartDate()), SysMobileScanLog::getScanTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysMobileScanLog::getScanTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMobileScanLog::getLogNo, query.getKeyword()).or()
                        .like(SysMobileScanLog::getBarcode, query.getKeyword()).or()
                        .like(SysMobileScanLog::getDocNo, query.getKeyword()))
                .orderByDesc(SysMobileScanLog::getId));
        return PageResult.of(page);
    }

    public SysMobileScanLog detail(Long id) {
        return require(id);
    }

    /** 新增或更新扫码日志：新增时回填默认扫码结果与操作人/组织，日志编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, MobileScanLogSaveRequest request) {
        SysMobileScanLog entity;
        if (id == null) {
            entity = new SysMobileScanLog();
            entity.setLogNo(StringUtils.hasText(request.getLogNo())
                    ? request.getLogNo() : flowSupport.nextBizNo("MSL"));
            entity.setScanResult(StringUtils.hasText(request.getScanResult())
                    ? request.getScanResult() : RESULT_SUCCESS);
            entity.setScanTime(request.getScanTime() == null ? LocalDateTime.now() : request.getScanTime());
            fillOperator(entity);
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

    /**
     * 记录扫码：先按条码做标签校验，再写扫码日志（结果 SUCCESS/FAIL、操作人/组织取当前用户、
     * 扫码时间取当前时间）；校验不通过时自动入队一条移动异常（类型 LABEL_INVALID），并返回扫码结果。
     */
    @Transactional(rollbackFor = Exception.class)
    public MobileScanResult recordScan(MobileScanRequest request) {
        LabelValidateResult validation = labelRuleService.validate(request.getBarcode(), null);
        boolean labelValid = Boolean.TRUE.equals(validation.getValid());

        SysMobileScanLog log = new SysMobileScanLog();
        log.setLogNo(flowSupport.nextBizNo("MSL"));
        log.setSceneCode(request.getSceneCode());
        log.setScanType(request.getScanType());
        log.setBarcode(request.getBarcode());
        log.setBizKey(request.getBizKey());
        log.setDocNo(request.getDocNo());
        log.setDeviceNo(request.getDeviceNo());
        log.setScanTime(LocalDateTime.now());
        log.setScanResult(labelValid ? RESULT_SUCCESS : RESULT_FAIL);
        log.setMessage(validation.getMessage());
        fillOperator(log);
        mapper.insert(log);

        if (!labelValid) {
            exceptionService.createException(request.getSceneCode(), request.getBarcode(),
                    ERROR_TYPE_LABEL_INVALID, validation.getMessage());
        }

        MobileScanResult result = new MobileScanResult();
        result.setLogNo(log.getLogNo());
        result.setBarcode(request.getBarcode());
        result.setScanResult(log.getScanResult());
        result.setMessage(log.getMessage());
        result.setLabelValid(labelValid);
        return result;
    }

    /** 删除扫码日志：物理删除以释放日志编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMobileScanLog require(Long id) {
        SysMobileScanLog entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "扫码日志不存在: " + id);
        }
        return entity;
    }

    /** 回填操作人与组织：取当前登录用户，展示名缺失时回退登录名。 */
    private void fillOperator(SysMobileScanLog entity) {
        UserContext.Principal principal = UserContext.get();
        if (principal == null) {
            return;
        }
        entity.setOperatorId(principal.userId());
        entity.setOperatorName(StringUtils.hasText(principal.displayName())
                ? principal.displayName() : principal.username());
        entity.setOrgId(principal.orgId());
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMobileScanLog entity, MobileScanLogSaveRequest request) {
        if (StringUtils.hasText(request.getLogNo())) {
            entity.setLogNo(request.getLogNo());
        }
        if (StringUtils.hasText(request.getSceneCode())) {
            entity.setSceneCode(request.getSceneCode());
        }
        if (StringUtils.hasText(request.getScanType())) {
            entity.setScanType(request.getScanType());
        }
        if (StringUtils.hasText(request.getBarcode())) {
            entity.setBarcode(request.getBarcode());
        }
        if (StringUtils.hasText(request.getBizKey())) {
            entity.setBizKey(request.getBizKey());
        }
        if (StringUtils.hasText(request.getDocNo())) {
            entity.setDocNo(request.getDocNo());
        }
        if (request.getOperatorId() != null) {
            entity.setOperatorId(request.getOperatorId());
        }
        if (StringUtils.hasText(request.getOperatorName())) {
            entity.setOperatorName(request.getOperatorName());
        }
        if (StringUtils.hasText(request.getDeviceNo())) {
            entity.setDeviceNo(request.getDeviceNo());
        }
        if (request.getScanTime() != null) {
            entity.setScanTime(request.getScanTime());
        }
        if (StringUtils.hasText(request.getScanResult())) {
            entity.setScanResult(request.getScanResult());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
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
}
