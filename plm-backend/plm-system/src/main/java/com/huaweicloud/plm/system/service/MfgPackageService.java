package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgPackageDetailResponse;
import com.huaweicloud.plm.system.dto.MfgPackageItemRequest;
import com.huaweicloud.plm.system.dto.MfgPackageQuery;
import com.huaweicloud.plm.system.dto.MfgPackageSaveRequest;
import com.huaweicloud.plm.system.dto.MfgPackageSealRequest;
import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgPackageItem;
import com.huaweicloud.plm.system.mapper.MfgPackageItemMapper;
import com.huaweicloud.plm.system.mapper.MfgPackageMapper;
import com.huaweicloud.plm.system.mapper.MfgTraceBindingMapper;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 包装管理服务（N8，DEV-089）：箱码/托盘码、内外箱关系、箱内产品清单与封箱。
 */
@Service
@RequiredArgsConstructor
public class MfgPackageService {

    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_SEALED = "SEALED";
    private static final String ITEM_PACKED = "PACKED";
    private static final String DEFAULT_LEVEL = "INNER";

    private final MfgPackageMapper mfgPackageMapper;
    private final MfgPackageItemMapper mfgPackageItemMapper;
    private final MfgTraceBindingMapper mfgTraceBindingMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgPackage> page(MfgPackageQuery query) {
        Page<MfgPackage> page = query.toPage();
        mfgPackageMapper.selectPage(page, Wrappers.<MfgPackage>lambdaQuery()
                .eq(StringUtils.hasText(query.getPackageNo()), MfgPackage::getPackageNo, query.getPackageNo())
                .eq(StringUtils.hasText(query.getPackageCode()), MfgPackage::getPackageCode, query.getPackageCode())
                .eq(StringUtils.hasText(query.getPackageLevel()), MfgPackage::getPackageLevel, query.getPackageLevel())
                .eq(StringUtils.hasText(query.getBatchNo()), MfgPackage::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getProductCode()), MfgPackage::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), MfgPackage::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getPackageStatus()), MfgPackage::getPackageStatus, query.getPackageStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgPackage::getPackageNo, query.getKeyword()).or()
                        .like(MfgPackage::getPackageCode, query.getKeyword()).or()
                        .like(MfgPackage::getBatchNo, query.getKeyword()))
                .orderByDesc(MfgPackage::getId));
        return PageResult.of(page);
    }

    public MfgPackageDetailResponse detail(String packageNo) {
        MfgPackage pkg = requirePackage(packageNo);
        MfgPackageDetailResponse response = new MfgPackageDetailResponse();
        response.setPkg(pkg);
        response.setItems(listItems(packageNo));
        return response;
    }

    public List<MfgPackageItem> listItems(String packageNo) {
        return mfgPackageItemMapper.selectList(Wrappers.<MfgPackageItem>lambdaQuery()
                .eq(MfgPackageItem::getPackageNo, packageNo)
                .orderByAsc(MfgPackageItem::getId));
    }

    public List<MfgPackage> listByBatch(String batchNo) {
        return mfgPackageMapper.selectList(Wrappers.<MfgPackage>lambdaQuery()
                .eq(MfgPackage::getBatchNo, batchNo)
                .orderByAsc(MfgPackage::getId));
    }

    public MfgPackage findByIdentifier(String identifier) {
        if (!StringUtils.hasText(identifier)) {
            return null;
        }
        return mfgPackageMapper.selectOne(Wrappers.<MfgPackage>lambdaQuery()
                .eq(MfgPackage::getPackageCode, identifier)
                .or()
                .eq(MfgPackage::getPackageNo, identifier)
                .last("limit 1"));
    }

    public MfgPackage requirePackage(String packageNo) {
        MfgPackage pkg = mfgPackageMapper.selectOne(Wrappers.<MfgPackage>lambdaQuery()
                .eq(MfgPackage::getPackageNo, packageNo));
        if (pkg == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "包装不存在: " + packageNo);
        }
        return pkg;
    }

    @Transactional
    public Long create(MfgPackageSaveRequest request) {
        String packageNo = StringUtils.hasText(request.getPackageNo())
                ? request.getPackageNo() : mfgSupport.nextNo("PKG");
        String packageCode = StringUtils.hasText(request.getPackageCode())
                ? request.getPackageCode() : packageNo;
        if (mfgPackageMapper.selectCount(Wrappers.<MfgPackage>lambdaQuery()
                .eq(MfgPackage::getPackageNo, packageNo)) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "包装编号已存在: " + packageNo);
        }
        MfgPackage pkg = new MfgPackage();
        pkg.setPackageNo(packageNo);
        pkg.setPackageCode(packageCode);
        applyFields(pkg, request);
        mfgPackageMapper.insert(pkg);

        List<MfgPackageItemRequest> items = resolveItems(request);
        if (items != null) {
            for (MfgPackageItemRequest itemRequest : items) {
                insertItem(pkg, itemRequest);
            }
        }
        refreshQty(pkg);
        return pkg.getId();
    }

    @Transactional
    public void update(String packageNo, MfgPackageSaveRequest request) {
        MfgPackage pkg = requirePackage(packageNo);
        if (STATUS_SEALED.equals(pkg.getPackageStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已封箱包装不允许修改，请先拆箱");
        }
        applyFields(pkg, request);
        List<MfgPackageItemRequest> items = resolveItems(request);
        if (items != null) {
            mfgPackageItemMapper.delete(Wrappers.<MfgPackageItem>lambdaQuery()
                    .eq(MfgPackageItem::getPackageNo, packageNo));
            for (MfgPackageItemRequest itemRequest : items) {
                insertItem(pkg, itemRequest);
            }
        }
        refreshQty(pkg);
        mfgPackageMapper.updateById(pkg);
    }

    /**
     * 按生产批次自动装箱：将该批次下已绑定追溯的单件码装入新箱。
     */
    @Transactional
    public Long packByBatch(String batchNo, String productCode, String customerCode, Integer maxQty, String operator) {
        List<MfgTraceBinding> bindings = mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(MfgTraceBinding::getBatchNo, batchNo)
                .orderByAsc(MfgTraceBinding::getId));
        if (bindings.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "生产批次下无追溯绑定，无法自动装箱: " + batchNo);
        }
        int limit = maxQty != null && maxQty > 0 ? maxQty : bindings.size();
        MfgPackage pkg = new MfgPackage();
        pkg.setPackageNo(mfgSupport.nextNo("PKG"));
        pkg.setPackageCode(pkg.getPackageNo());
        pkg.setPackageLevel(DEFAULT_LEVEL);
        pkg.setProductCode(StringUtils.hasText(productCode) ? productCode : bindings.get(0).getProductCode());
        pkg.setBatchNo(batchNo);
        pkg.setCustomerCode(customerCode);
        pkg.setPackageQty(BigDecimal.ZERO);
        pkg.setPackageStatus(STATUS_OPEN);
        pkg.setOperator(operator);
        mfgPackageMapper.insert(pkg);

        int count = 0;
        for (MfgTraceBinding binding : bindings) {
            if (count >= limit) {
                break;
            }
            MfgPackageItemRequest itemRequest = new MfgPackageItemRequest();
            itemRequest.setSerialNo(binding.getSerialNo());
            itemRequest.setTraceCode(binding.getTraceCode());
            itemRequest.setMaterialCode(binding.getProductCode());
            itemRequest.setMaterialBatchNo(binding.getBatchNo());
            itemRequest.setQuantity(BigDecimal.ONE);
            insertItem(pkg, itemRequest);
            count++;
        }
        refreshQty(pkg);
        mfgPackageMapper.updateById(pkg);
        return pkg.getId();
    }

    @Transactional
    public void seal(String packageNo, MfgPackageSealRequest request) {
        MfgPackage pkg = requirePackage(packageNo);
        if (STATUS_SEALED.equals(pkg.getPackageStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "包装已封箱: " + packageNo);
        }
        List<MfgPackageItem> items = listItems(packageNo);
        if (items.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "空箱不允许封箱: " + packageNo);
        }
        pkg.setPackageStatus(STATUS_SEALED);
        pkg.setPackedAt(LocalDateTime.now());
        pkg.setOperator(request != null ? request.getOperator() : null);
        if (request != null && StringUtils.hasText(request.getRemark())) {
            pkg.setRemark(request.getRemark());
        }
        mfgPackageMapper.updateById(pkg);
    }

    public void delete(String packageNo) {
        MfgPackage pkg = requirePackage(packageNo);
        if (STATUS_SEALED.equals(pkg.getPackageStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已封箱包装不允许删除");
        }
        mfgPackageItemMapper.delete(Wrappers.<MfgPackageItem>lambdaQuery()
                .eq(MfgPackageItem::getPackageNo, packageNo));
        mfgPackageMapper.deleteById(pkg.getId());
    }

    private List<MfgPackageItemRequest> resolveItems(MfgPackageSaveRequest request) {
        if (request.getItems() != null) {
            return request.getItems();
        }
        return request.getLines();
    }

    private void insertItem(MfgPackage pkg, MfgPackageItemRequest itemRequest) {
        MfgPackageItem item = new MfgPackageItem();
        item.setPackageNo(pkg.getPackageNo());
        item.setSerialNo(itemRequest.getSerialNo());
        item.setTraceCode(StringUtils.hasText(itemRequest.getTraceCode())
                ? itemRequest.getTraceCode() : itemRequest.getSerialNo());
        item.setMaterialCode(itemRequest.getMaterialCode());
        item.setMaterialBatchNo(itemRequest.getMaterialBatchNo());
        item.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : BigDecimal.ONE);
        item.setItemStatus(StringUtils.hasText(itemRequest.getItemStatus())
                ? itemRequest.getItemStatus() : ITEM_PACKED);
        item.setRemark(itemRequest.getRemark());
        mfgPackageItemMapper.insert(item);
    }

    /**
     * 依据箱内明细数量重算包装数量。
     */
    private void refreshQty(MfgPackage pkg) {
        List<MfgPackageItem> items = listItems(pkg.getPackageNo());
        BigDecimal total = BigDecimal.ZERO;
        for (MfgPackageItem item : items) {
            total = total.add(item.getQuantity() == null ? BigDecimal.ZERO : item.getQuantity());
        }
        pkg.setPackageQty(total);
    }

    private void applyFields(MfgPackage pkg, MfgPackageSaveRequest request) {
        pkg.setPackageLevel(StringUtils.hasText(request.getPackageLevel())
                ? request.getPackageLevel() : DEFAULT_LEVEL);
        pkg.setParentPackageNo(request.getParentPackageNo());
        pkg.setProductCode(request.getProductCode());
        pkg.setBatchNo(request.getBatchNo());
        pkg.setWorkOrderNo(request.getWorkOrderNo());
        pkg.setCustomerCode(request.getCustomerCode());
        pkg.setOperator(request.getOperator());
        if (request.getPackageQty() != null) {
            pkg.setPackageQty(request.getPackageQty());
        } else if (pkg.getPackageQty() == null) {
            pkg.setPackageQty(BigDecimal.ZERO);
        }
        if (!StringUtils.hasText(pkg.getPackageStatus())) {
            pkg.setPackageStatus(STATUS_OPEN);
        }
        if (StringUtils.hasText(request.getRemark())) {
            pkg.setRemark(request.getRemark());
        }
    }
}
