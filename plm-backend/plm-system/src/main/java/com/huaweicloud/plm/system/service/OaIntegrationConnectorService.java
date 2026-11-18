package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizConnectorSyncLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizIntegrationConnectorSaveRequest;
import com.huaweicloud.plm.system.dto.BizMasterDataMappingSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaConnectorSyncLog;
import com.huaweicloud.plm.system.entity.OaIntegrationConnector;
import com.huaweicloud.plm.system.entity.OaMasterDataMapping;
import com.huaweicloud.plm.system.mapper.OaConnectorSyncLogMapper;
import com.huaweicloud.plm.system.mapper.OaIntegrationConnectorMapper;
import com.huaweicloud.plm.system.mapper.OaMasterDataMappingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 集成连接器（OA-DEV-089 ~ OA-DEV-093）：PLM/ERP/MES/QMS/EDI 连接器、同步记录（来源标识、时间戳、回执）
 * 与主数据映射（权威源与同步方向）。
 */
@Service
@RequiredArgsConstructor
public class OaIntegrationConnectorService {

    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final OaIntegrationConnectorMapper connectorMapper;
    private final OaConnectorSyncLogMapper syncLogMapper;
    private final OaMasterDataMappingMapper mappingMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 连接器 =================

    public PageResult<OaIntegrationConnector> pageConnectors(OaIntegrationQuery query) {
        Page<OaIntegrationConnector> page = query.toPage();
        connectorMapper.selectPage(page, Wrappers.<OaIntegrationConnector>lambdaQuery()
                .eq(StringUtils.hasText(query.getSystemCode()), OaIntegrationConnector::getSystemCode, query.getSystemCode())
                .eq(query.getStatus() != null, OaIntegrationConnector::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaIntegrationConnector::getConnectorNo, query.getKeyword()).or()
                        .like(OaIntegrationConnector::getConnectorName, query.getKeyword()).or()
                        .like(OaIntegrationConnector::getBaseUrl, query.getKeyword()))
                .orderByAsc(OaIntegrationConnector::getSystemCode)
                .orderByDesc(OaIntegrationConnector::getId));
        return PageResult.of(page);
    }

    public OaIntegrationConnector detailConnector(Long id) {
        return requireConnector(id);
    }

    public List<OaIntegrationConnector> listEnabledConnectors() {
        return connectorMapper.selectList(Wrappers.<OaIntegrationConnector>lambdaQuery()
                .eq(OaIntegrationConnector::getStatus, 1)
                .orderByAsc(OaIntegrationConnector::getSystemCode));
    }

    @Transactional
    public Long saveConnector(Long id, BizIntegrationConnectorSaveRequest request) {
        if (!StringUtils.hasText(request.getConnectorName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "连接器名称不能为空");
        }
        if (!StringUtils.hasText(request.getSystemCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "系统编码不能为空");
        }
        OaIntegrationConnector entity;
        if (id == null) {
            entity = new OaIntegrationConnector();
            entity.setConnectorNo(StringUtils.hasText(request.getConnectorNo())
                    ? request.getConnectorNo() : flowSupport.nextBizNo("CON"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireConnector(id);
            if (StringUtils.hasText(request.getConnectorNo())) {
                entity.setConnectorNo(request.getConnectorNo());
            }
        }
        entity.setConnectorName(request.getConnectorName());
        entity.setSystemCode(request.getSystemCode());
        entity.setSystemType(StringUtils.hasText(request.getSystemType())
                ? request.getSystemType() : request.getSystemCode());
        entity.setBaseUrl(request.getBaseUrl());
        entity.setAuthType(StringUtils.hasText(request.getAuthType()) ? request.getAuthType() : "OAUTH2");
        entity.setAuthoritySystem(request.getAuthoritySystem());
        entity.setSyncDirection(StringUtils.hasText(request.getSyncDirection())
                ? request.getSyncDirection() : "BIDIRECTIONAL");
        entity.setSsoFlag(toFlag(request.getSsoFlag()));
        entity.setTodoSyncFlag(toFlag(request.getTodoSyncFlag()));
        entity.setMasterDataScope(request.getMasterDataScope());
        entity.setCredentialId(request.getCredentialId());
        entity.setCredentialExpireDate(OaBizFlowSupport.parseDate(request.getCredentialExpireDate()));
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setRemark(request.getRemark());
        if (id == null) {
            connectorMapper.insert(entity);
        } else {
            connectorMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteConnector(Long id) {
        requireConnector(id);
        connectorMapper.deleteById(id);
    }

    // ================= 同步记录 =================

    public PageResult<OaConnectorSyncLog> pageSyncLogs(OaIntegrationQuery query) {
        Page<OaConnectorSyncLog> page = query.toPage();
        syncLogMapper.selectPage(page, Wrappers.<OaConnectorSyncLog>lambdaQuery()
                .eq(query.getConnectorId() != null, OaConnectorSyncLog::getConnectorId, query.getConnectorId())
                .eq(StringUtils.hasText(query.getSystemCode()), OaConnectorSyncLog::getSystemCode, query.getSystemCode())
                .eq(StringUtils.hasText(query.getObjectType()), OaConnectorSyncLog::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getDirection()), OaConnectorSyncLog::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getSyncStatus()), OaConnectorSyncLog::getSyncStatus, query.getSyncStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaConnectorSyncLog::getReceiptNo, query.getKeyword()).or()
                        .like(OaConnectorSyncLog::getConnectorNo, query.getKeyword()).or()
                        .like(OaConnectorSyncLog::getSourceFlag, query.getKeyword()))
                .orderByDesc(OaConnectorSyncLog::getId));
        return PageResult.of(page);
    }

    public OaConnectorSyncLog detailSyncLog(Long id) {
        return requireSyncLog(id);
    }

    /** 登记同步记录。 */
    @Transactional
    public Long recordSyncLog(BizConnectorSyncLogSaveRequest request) {
        OaIntegrationConnector connector = requireConnector(request.getConnectorId());
        return doRecordSyncLog(connector, request);
    }

    /** 触发一次连接器同步（模拟同步并生成同步记录与回执）。 */
    @Transactional
    public Long performSync(Long connectorId, BizConnectorSyncLogSaveRequest request) {
        OaIntegrationConnector connector = requireConnector(connectorId);
        if (!Integer.valueOf(1).equals(connector.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "连接器已停用，无法同步: " + connector.getConnectorName());
        }
        Long syncId = doRecordSyncLog(connector, request);
        connector.setLastSyncTime(LocalDateTime.now());
        connectorMapper.updateById(connector);
        return syncId;
    }

    private Long doRecordSyncLog(OaIntegrationConnector connector, BizConnectorSyncLogSaveRequest request) {
        if (!StringUtils.hasText(request.getObjectType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "对象类型不能为空");
        }
        OaConnectorSyncLog entity = new OaConnectorSyncLog();
        entity.setConnectorId(connector.getId());
        entity.setConnectorNo(connector.getConnectorNo());
        entity.setSystemCode(connector.getSystemCode());
        entity.setObjectType(request.getObjectType());
        entity.setDirection(StringUtils.hasText(request.getDirection()) ? request.getDirection()
                : resolveDirection(connector.getSyncDirection()));
        entity.setSourceFlag(StringUtils.hasText(request.getSourceFlag())
                ? request.getSourceFlag() : connector.getSystemCode() + "-" + request.getObjectType());
        entity.setDataTimestamp(parseTimestamp(request.getDataTimestamp()));
        entity.setRecordCount(request.getRecordCount() != null ? request.getRecordCount() : 0);
        String status = StringUtils.hasText(request.getSyncStatus()) ? request.getSyncStatus() : "SUCCESS";
        entity.setSyncStatus(status);
        entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                ? request.getReceiptNo() : flowSupport.nextBizNo("RCT"));
        entity.setReceiptStatus(StringUtils.hasText(request.getReceiptStatus()) ? request.getReceiptStatus()
                : ("SUCCESS".equals(status) ? "ACCEPTED" : "REJECTED"));
        entity.setCostMs(request.getCostMs());
        entity.setErrorMsg(request.getErrorMsg());
        entity.setOperatorUserId(UserContext.getUserId());
        entity.setOperatorName(currentDisplayName());
        entity.setSyncTime(LocalDateTime.now());
        entity.setOrgId(currentOrgId());
        entity.setRemark(request.getRemark());
        syncLogMapper.insert(entity);
        return entity.getId();
    }

    @Transactional
    public void deleteSyncLog(Long id) {
        requireSyncLog(id);
        syncLogMapper.deleteById(id);
    }

    // ================= 主数据映射 =================

    public PageResult<OaMasterDataMapping> pageMappings(OaIntegrationQuery query) {
        Page<OaMasterDataMapping> page = query.toPage();
        mappingMapper.selectPage(page, Wrappers.<OaMasterDataMapping>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), OaMasterDataMapping::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getSystemCode()), OaMasterDataMapping::getAuthoritySystem, query.getSystemCode())
                .eq(query.getStatus() != null, OaMasterDataMapping::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMasterDataMapping::getMappingNo, query.getKeyword()).or()
                        .like(OaMasterDataMapping::getLocalCode, query.getKeyword()).or()
                        .like(OaMasterDataMapping::getExternalCode, query.getKeyword()))
                .orderByDesc(OaMasterDataMapping::getId));
        return PageResult.of(page);
    }

    public OaMasterDataMapping detailMapping(Long id) {
        return requireMapping(id);
    }

    @Transactional
    public Long saveMapping(Long id, BizMasterDataMappingSaveRequest request) {
        if (!StringUtils.hasText(request.getObjectType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "对象类型不能为空");
        }
        if (!StringUtils.hasText(request.getLocalCode()) || !StringUtils.hasText(request.getExternalCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "本地编码与外部编码不能为空");
        }
        OaMasterDataMapping entity;
        if (id == null) {
            entity = new OaMasterDataMapping();
            entity.setMappingNo(StringUtils.hasText(request.getMappingNo())
                    ? request.getMappingNo() : flowSupport.nextBizNo("MDM"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireMapping(id);
            if (StringUtils.hasText(request.getMappingNo())) {
                entity.setMappingNo(request.getMappingNo());
            }
        }
        entity.setObjectType(request.getObjectType());
        entity.setLocalCode(request.getLocalCode());
        entity.setExternalCode(request.getExternalCode());
        entity.setAuthoritySystem(StringUtils.hasText(request.getAuthoritySystem())
                ? request.getAuthoritySystem() : flowSupport.configString("oa.customer.master.authority", "ERP"));
        entity.setSourceSystem(request.getSourceSystem());
        entity.setSyncDirection(StringUtils.hasText(request.getSyncDirection())
                ? request.getSyncDirection() : "INBOUND");
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setLastSyncTime(LocalDateTime.now());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mappingMapper.insert(entity);
        } else {
            mappingMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteMapping(Long id) {
        requireMapping(id);
        mappingMapper.deleteById(id);
    }

    // ================= 辅助 =================

    public OaIntegrationConnector requireConnector(Long id) {
        OaIntegrationConnector entity = connectorMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "集成连接器不存在: " + id);
        }
        return entity;
    }

    public OaConnectorSyncLog requireSyncLog(Long id) {
        OaConnectorSyncLog entity = syncLogMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "同步记录不存在: " + id);
        }
        return entity;
    }

    public OaMasterDataMapping requireMapping(Long id) {
        OaMasterDataMapping entity = mappingMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据映射不存在: " + id);
        }
        return entity;
    }

    private String resolveDirection(String connectorDirection) {
        if ("INBOUND".equals(connectorDirection) || "OUTBOUND".equals(connectorDirection)) {
            return connectorDirection;
        }
        return "INBOUND";
    }

    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private Integer toFlag(Boolean value) {
        return Boolean.TRUE.equals(value) ? 1 : 0;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }
}
