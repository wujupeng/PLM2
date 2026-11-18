package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SupplierQuery;
import com.huaweicloud.plm.system.dto.SupplierSaveRequest;
import com.huaweicloud.plm.system.entity.MdSupplier;
import com.huaweicloud.plm.system.mapper.MdSupplierMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 供应商主数据服务（DEV-022）。
 */
@Service
@RequiredArgsConstructor
public class SupplierService {

    private final MdSupplierMapper supplierMapper;

    public PageResult<MdSupplier> page(SupplierQuery query) {
        Page<MdSupplier> page = query.toPage();
        supplierMapper.selectPage(page, Wrappers.<MdSupplier>lambdaQuery()
                .eq(query.getStatus() != null, MdSupplier::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MdSupplier::getSupplierCode, query.getKeyword()).or()
                        .like(MdSupplier::getSupplierName, query.getKeyword()))
                .orderByDesc(MdSupplier::getCreatedAt));
        return PageResult.of(page);
    }

    public List<MdSupplier> options() {
        return supplierMapper.selectList(Wrappers.<MdSupplier>lambdaQuery()
                .eq(MdSupplier::getStatus, 1)
                .orderByAsc(MdSupplier::getSupplierCode));
    }

    public Long create(SupplierSaveRequest request) {
        if (supplierMapper.countByCode(request.getSupplierCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "供应商编码已存在: " + request.getSupplierCode());
        }
        MdSupplier supplier = new MdSupplier();
        applyRequest(supplier, request);
        supplierMapper.insert(supplier);
        return supplier.getId();
    }

    public void update(Long supplierId, SupplierSaveRequest request) {
        MdSupplier supplier = requireSupplier(supplierId);
        if (!supplier.getSupplierCode().equals(request.getSupplierCode())
                && supplierMapper.countByCode(request.getSupplierCode(), supplierId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "供应商编码已存在: " + request.getSupplierCode());
        }
        applyRequest(supplier, request);
        supplierMapper.updateById(supplier);
    }

    public void delete(Long supplierId) {
        requireSupplier(supplierId);
        supplierMapper.deleteById(supplierId);
    }

    private void applyRequest(MdSupplier supplier, SupplierSaveRequest request) {
        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContact(request.getContact());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        supplier.setRemark(request.getRemark());
    }

    private MdSupplier requireSupplier(Long supplierId) {
        MdSupplier supplier = supplierMapper.selectById(supplierId);
        if (supplier == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商不存在: " + supplierId);
        }
        return supplier;
    }
}
