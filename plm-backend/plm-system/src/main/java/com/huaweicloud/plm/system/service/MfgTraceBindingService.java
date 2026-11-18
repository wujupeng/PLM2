package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgTraceBindingQuery;
import com.huaweicloud.plm.system.dto.MfgTraceBindingSaveRequest;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import com.huaweicloud.plm.system.mapper.MfgTraceBindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 单件/批次追溯码绑定服务（N8，DEV-088）：追溯码与生产批次、物料批次、工序的绑定关系。
 */
@Service
@RequiredArgsConstructor
public class MfgTraceBindingService {

    private static final String DEFAULT_TRACE_TYPE = "SINGLE";

    private final MfgTraceBindingMapper mfgTraceBindingMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgTraceBinding> page(MfgTraceBindingQuery query) {
        Page<MfgTraceBinding> page = query.toPage();
        mfgTraceBindingMapper.selectPage(page, Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(StringUtils.hasText(query.getTraceCode()), MfgTraceBinding::getTraceCode, query.getTraceCode())
                .eq(StringUtils.hasText(query.getBatchNo()), MfgTraceBinding::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getSerialNo()), MfgTraceBinding::getSerialNo, query.getSerialNo())
                .eq(StringUtils.hasText(query.getProductCode()), MfgTraceBinding::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), MfgTraceBinding::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getMaterialBatchNo()), MfgTraceBinding::getMaterialBatchNo, query.getMaterialBatchNo())
                .eq(StringUtils.hasText(query.getTraceType()), MfgTraceBinding::getTraceType, query.getTraceType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgTraceBinding::getTraceCode, query.getKeyword()).or()
                        .like(MfgTraceBinding::getBindingNo, query.getKeyword()).or()
                        .like(MfgTraceBinding::getBatchNo, query.getKeyword()).or()
                        .like(MfgTraceBinding::getMaterialBatchNo, query.getKeyword()))
                .orderByDesc(MfgTraceBinding::getId));
        return PageResult.of(page);
    }

    public List<MfgTraceBinding> listByTraceCode(String traceCode) {
        return mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(MfgTraceBinding::getTraceCode, traceCode)
                .orderByAsc(MfgTraceBinding::getId));
    }

    public List<MfgTraceBinding> listByBatch(String batchNo) {
        return mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(MfgTraceBinding::getBatchNo, batchNo)
                .orderByAsc(MfgTraceBinding::getId));
    }

    public List<MfgTraceBinding> listByMaterialBatch(String materialCode, String materialBatchNo) {
        return mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(StringUtils.hasText(materialCode), MfgTraceBinding::getMaterialCode, materialCode)
                .eq(StringUtils.hasText(materialBatchNo), MfgTraceBinding::getMaterialBatchNo, materialBatchNo)
                .orderByAsc(MfgTraceBinding::getId));
    }

    public MfgTraceBinding require(Long id) {
        MfgTraceBinding binding = mfgTraceBindingMapper.selectById(id);
        if (binding == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "追溯绑定不存在: " + id);
        }
        return binding;
    }

    public Long create(MfgTraceBindingSaveRequest request) {
        String bindingNo = StringUtils.hasText(request.getBindingNo())
                ? request.getBindingNo() : mfgSupport.nextNo("TB");
        MfgTraceBinding binding = new MfgTraceBinding();
        binding.setBindingNo(bindingNo);
        applyFields(binding, request);
        mfgTraceBindingMapper.insert(binding);
        return binding.getId();
    }

    public void update(Long id, MfgTraceBindingSaveRequest request) {
        MfgTraceBinding binding = require(id);
        applyFields(binding, request);
        mfgTraceBindingMapper.updateById(binding);
    }

    public void delete(Long id) {
        require(id);
        mfgTraceBindingMapper.deleteById(id);
    }

    private void applyFields(MfgTraceBinding binding, MfgTraceBindingSaveRequest request) {
        binding.setTraceCode(request.getTraceCode());
        binding.setTraceType(StringUtils.hasText(request.getTraceType())
                ? request.getTraceType() : DEFAULT_TRACE_TYPE);
        binding.setBatchNo(request.getBatchNo());
        binding.setSerialNo(StringUtils.hasText(request.getSerialNo())
                ? request.getSerialNo() : request.getTraceCode());
        binding.setProductCode(request.getProductCode());
        binding.setMaterialCode(request.getMaterialCode());
        binding.setMaterialName(request.getMaterialName());
        binding.setMaterialBatchNo(request.getMaterialBatchNo());
        binding.setMaterialSupplier(request.getMaterialSupplier());
        binding.setOperationCode(request.getOperationCode());
        binding.setQuantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ONE);
        binding.setUnit(request.getUnit());
        binding.setBindTime(request.getBindTime() != null ? request.getBindTime() : LocalDateTime.now());
        binding.setSourceSystem(request.getSourceSystem());
        binding.setRemark(request.getRemark());
    }
}
