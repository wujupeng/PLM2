package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysIdempotentRecordSaveRequest;
import com.huaweicloud.plm.system.entity.SysIdempotentRecord;
import com.huaweicloud.plm.system.mapper.SysIdempotentRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 幂等记录（G1-N1 集成平台，WBS T009）：幂等键登记、结果回写与重复识别。
 * 幂等键有效期取自可配置项 integration.idempotent.expire.hours，便于按业务调整保留窗口。
 */
@Service
@RequiredArgsConstructor
public class SysIdempotentRecordService {

    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_DUPLICATE = "DUPLICATE";
    private static final String STATUS_FAILED = "FAILED";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysIdempotentRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询幂等记录：关键字匹配幂等键/业务类型/业务ID/请求摘要，状态精确，时间区间作用于创建时间。 */
    public PageResult<SysIdempotentRecord> pageRecords(IntegrationQuery query) {
        Page<SysIdempotentRecord> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysIdempotentRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordStatus()),
                        SysIdempotentRecord::getRecordStatus, query.getRecordStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysIdempotentRecord::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysIdempotentRecord::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysIdempotentRecord::getIdempotentKey, query.getKeyword()).or()
                        .like(SysIdempotentRecord::getBizType, query.getKeyword()).or()
                        .like(SysIdempotentRecord::getBizId, query.getKeyword()).or()
                        .like(SysIdempotentRecord::getRequestHash, query.getKeyword()))
                .orderByDesc(SysIdempotentRecord::getId));
        return PageResult.of(page);
    }

    public SysIdempotentRecord detail(Long id) {
        return require(id);
    }

    /** 新增或更新幂等记录：新增时校验幂等键唯一，并回填默认状态与过期时间。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysIdempotentRecordSaveRequest request) {
        SysIdempotentRecord entity;
        if (id == null) {
            if (findByKey(request.getIdempotentKey()) != null) {
                throw new BusinessException(ResultCode.CONFLICT, "幂等键已存在，重复请求");
            }
            entity = new SysIdempotentRecord();
            entity.setIdempotentKey(request.getIdempotentKey());
            entity.setRecordStatus(StringUtils.hasText(request.getRecordStatus())
                    ? request.getRecordStatus() : STATUS_PROCESSING);
            entity.setExpireAt(resolveExpireAt(request.getExpireAt()));
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getIdempotentKey())) {
                entity.setIdempotentKey(request.getIdempotentKey());
            }
            if (StringUtils.hasText(request.getRecordStatus())) {
                entity.setRecordStatus(request.getRecordStatus());
            }
            if (StringUtils.hasText(request.getExpireAt())) {
                entity.setExpireAt(parseTimestamp(request.getExpireAt()));
            }
        }
        entity.setBizType(request.getBizType());
        entity.setBizId(request.getBizId());
        entity.setRequestHash(request.getRequestHash());
        entity.setResultCode(request.getResultCode());
        entity.setOperatorName(request.getOperatorName());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 标记处理成功：状态置为 SUCCESS，结果码为空时补 200。 */
    @Transactional(rollbackFor = Exception.class)
    public SysIdempotentRecord markSuccess(Long id) {
        SysIdempotentRecord entity = require(id);
        entity.setRecordStatus(STATUS_SUCCESS);
        if (entity.getResultCode() == null) {
            entity.setResultCode(200);
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 标记重复请求：状态置为 DUPLICATE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysIdempotentRecord markDuplicate(Long id) {
        SysIdempotentRecord entity = require(id);
        entity.setRecordStatus(STATUS_DUPLICATE);
        mapper.updateById(entity);
        return entity;
    }

    /** 标记处理失败：状态置为 FAILED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysIdempotentRecord markFail(Long id) {
        SysIdempotentRecord entity = require(id);
        entity.setRecordStatus(STATUS_FAILED);
        mapper.updateById(entity);
        return entity;
    }

    /** 删除幂等记录：物理删除以释放幂等键，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 幂等键检查：返回是否存在及命中记录的关键信息，供上游投递前判重。 */
    public Map<String, Object> check(String idempotentKey) {
        SysIdempotentRecord record = StringUtils.hasText(idempotentKey) ? findByKey(idempotentKey) : null;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("exists", record != null);
        result.put("recordStatus", record == null ? null : record.getRecordStatus());
        result.put("bizType", record == null ? null : record.getBizType());
        result.put("bizId", record == null ? null : record.getBizId());
        return result;
    }

    /** 幂等记录统计：按状态汇总并回显幂等键有效期（小时）。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("processing", countByStatus(STATUS_PROCESSING));
        result.put("success", countByStatus(STATUS_SUCCESS));
        result.put("duplicate", countByStatus(STATUS_DUPLICATE));
        result.put("failed", countByStatus(STATUS_FAILED));
        result.put("expireHours", flowSupport.configInt("integration.idempotent.expire.hours", 24));
        return result;
    }

    public SysIdempotentRecord require(Long id) {
        SysIdempotentRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "幂等记录不存在: " + id);
        }
        return entity;
    }

    private Long countByStatus(String recordStatus) {
        Long count = mapper.selectCount(Wrappers.<SysIdempotentRecord>lambdaQuery()
                .eq(SysIdempotentRecord::getRecordStatus, recordStatus));
        return count == null ? 0L : count;
    }

    private SysIdempotentRecord findByKey(String idempotentKey) {
        if (!StringUtils.hasText(idempotentKey)) {
            return null;
        }
        return mapper.selectOne(Wrappers.<SysIdempotentRecord>lambdaQuery()
                .eq(SysIdempotentRecord::getIdempotentKey, idempotentKey)
                .last("LIMIT 1"));
    }

    /** 解析过期时间：为空时按配置有效期取当前时间加 N 小时。 */
    private LocalDateTime resolveExpireAt(String value) {
        LocalDateTime parsed = parseTimestamp(value);
        if (parsed != null) {
            return parsed;
        }
        int hours = flowSupport.configInt("integration.idempotent.expire.hours", 24);
        return LocalDateTime.now().plusHours(hours);
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
