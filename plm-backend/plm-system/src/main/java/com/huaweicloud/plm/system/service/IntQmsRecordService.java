package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntQmsRecordQuery;
import com.huaweicloud.plm.system.dto.IntQmsRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntQmsRecord;
import com.huaweicloud.plm.system.mapper.IntQmsRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** QMS 质量记录服务（N9，DEV-097）。 */
@Service
@RequiredArgsConstructor
public class IntQmsRecordService {

    private static final String DEFAULT_INTERFACE_STATUS = "RECEIVED";

    private final IntQmsRecordMapper qmsRecordMapper;
    private final IntSupportService intSupport;

    /**
     * 分页查询 QMS 质量记录。
     */
    public PageResult<IntQmsRecord> page(IntQmsRecordQuery query) {
        Page<IntQmsRecord> page = query.toPage();
        qmsRecordMapper.selectPage(page, Wrappers.<IntQmsRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordNo()), IntQmsRecord::getRecordNo, query.getRecordNo())
                .eq(StringUtils.hasText(query.getRecordType()), IntQmsRecord::getRecordType, query.getRecordType())
                .eq(StringUtils.hasText(query.getProductCode()), IntQmsRecord::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), IntQmsRecord::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), IntQmsRecord::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getResult()), IntQmsRecord::getResult, query.getResult())
                .eq(StringUtils.hasText(query.getDefectLevel()), IntQmsRecord::getDefectLevel, query.getDefectLevel())
                .eq(StringUtils.hasText(query.getInterfaceStatus()),
                        IntQmsRecord::getInterfaceStatus, query.getInterfaceStatus())
                .eq(StringUtils.hasText(query.getSourceSystem()), IntQmsRecord::getSourceSystem, query.getSourceSystem())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntQmsRecord::getRecordNo, query.getKeyword()).or()
                        .like(IntQmsRecord::getSourceNo, query.getKeyword()).or()
                        .like(IntQmsRecord::getProductCode, query.getKeyword()).or()
                        .like(IntQmsRecord::getMaterialCode, query.getKeyword()))
                .orderByDesc(IntQmsRecord::getId));
        return PageResult.of(page);
    }

    /**
     * 按记录编号获取质量记录，不存在时抛出业务异常。
     */
    public IntQmsRecord require(String recordNo) {
        IntQmsRecord entity = qmsRecordMapper.selectOne(Wrappers.<IntQmsRecord>lambdaQuery()
                .eq(IntQmsRecord::getRecordNo, recordNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "QMS 记录不存在: " + recordNo);
        }
        return entity;
    }

    /**
     * 新增质量记录，返回记录编号。
     */
    public String create(IntQmsRecordSaveRequest request) {
        IntQmsRecord entity = new IntQmsRecord();
        entity.setRecordNo(StringUtils.hasText(request.getRecordNo())
                ? request.getRecordNo() : intSupport.nextNo("QR"));
        applyFields(entity, request);
        if (!StringUtils.hasText(entity.getInterfaceStatus())) {
            entity.setInterfaceStatus(DEFAULT_INTERFACE_STATUS);
        }
        if (entity.getOccurredAt() == null) {
            entity.setOccurredAt(LocalDateTime.now());
        }
        qmsRecordMapper.insert(entity);
        return entity.getRecordNo();
    }

    /**
     * 更新质量记录。
     */
    public void update(String recordNo, IntQmsRecordSaveRequest request) {
        IntQmsRecord entity = require(recordNo);
        applyFields(entity, request);
        qmsRecordMapper.updateById(entity);
    }

    /**
     * 删除质量记录。
     */
    public void delete(String recordNo) {
        IntQmsRecord entity = require(recordNo);
        qmsRecordMapper.deleteById(entity.getId());
    }

    /**
     * 接收 QMS 接口数据：已存在按记录编号更新，否则新增，返回记录实体。
     */
    public IntQmsRecord receive(IntQmsRecordSaveRequest request) {
        if (StringUtils.hasText(request.getRecordNo())) {
            IntQmsRecord existing = qmsRecordMapper.selectOne(Wrappers.<IntQmsRecord>lambdaQuery()
                    .eq(IntQmsRecord::getRecordNo, request.getRecordNo()));
            if (existing != null) {
                applyFields(existing, request);
                if (!StringUtils.hasText(existing.getInterfaceStatus())) {
                    existing.setInterfaceStatus(DEFAULT_INTERFACE_STATUS);
                }
                if (existing.getOccurredAt() == null) {
                    existing.setOccurredAt(LocalDateTime.now());
                }
                qmsRecordMapper.updateById(existing);
                return existing;
            }
        }
        return require(create(request));
    }

    /**
     * 将请求字段写入实体。
     */
    private void applyFields(IntQmsRecord entity, IntQmsRecordSaveRequest request) {
        entity.setRecordType(request.getRecordType());
        entity.setSourceNo(request.getSourceNo());
        entity.setProductCode(request.getProductCode());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setBatchNo(request.getBatchNo());
        entity.setProductVersion(request.getProductVersion());
        entity.setInspectionItem(request.getInspectionItem());
        entity.setResult(request.getResult());
        entity.setDefectCode(request.getDefectCode());
        entity.setDefectLevel(request.getDefectLevel());
        entity.setDisposition(request.getDisposition());
        entity.setOccurredAt(request.getOccurredAt());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setRelatedProductCode(request.getRelatedProductCode());
        entity.setAttachmentUrl(request.getAttachmentUrl());
        entity.setInterfaceStatus(request.getInterfaceStatus());
        entity.setRemark(request.getRemark());
    }
}
