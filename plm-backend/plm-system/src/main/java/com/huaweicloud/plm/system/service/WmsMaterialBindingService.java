package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.WmsBindingQuery;
import com.huaweicloud.plm.system.dto.WmsBindingSaveRequest;
import com.huaweicloud.plm.system.entity.WmsMaterialBinding;
import com.huaweicloud.plm.system.mapper.WmsMaterialBindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 防混料绑定服务（N7，DEV-080）。
 */
@Service
@RequiredArgsConstructor
public class WmsMaterialBindingService {

    private static final String STATUS_ENABLED = "enabled";
    private static final String NO_PREFIX = "BIND";

    private final WmsMaterialBindingMapper wmsMaterialBindingMapper;
    private final WmsSupportService wmsSupportService;

    public PageResult<WmsMaterialBinding> page(WmsBindingQuery query) {
        Page<WmsMaterialBinding> page = query.toPage();
        wmsMaterialBindingMapper.selectPage(page, Wrappers.<WmsMaterialBinding>lambdaQuery()
                .eq(StringUtils.hasText(query.getBindType()), WmsMaterialBinding::getBindType, query.getBindType())
                .eq(StringUtils.hasText(query.getLineCode()), WmsMaterialBinding::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkStation()), WmsMaterialBinding::getWorkStation, query.getWorkStation())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsMaterialBinding::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBindStatus()), WmsMaterialBinding::getBindStatus, query.getBindStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsMaterialBinding::getBindingNo, query.getKeyword()).or()
                        .like(WmsMaterialBinding::getMaterialCode, query.getKeyword()))
                .orderByDesc(WmsMaterialBinding::getId));
        return PageResult.of(page);
    }

    public List<WmsMaterialBinding> listActiveByLine(String lineCode) {
        return wmsMaterialBindingMapper.selectList(Wrappers.<WmsMaterialBinding>lambdaQuery()
                .eq(WmsMaterialBinding::getBindStatus, STATUS_ENABLED)
                .eq(WmsMaterialBinding::getLineCode, lineCode)
                .orderByDesc(WmsMaterialBinding::getId));
    }

    /**
     * 查找生效绑定：优先工位精确匹配，其次产线匹配，返回第一条或 null。
     */
    public WmsMaterialBinding findEffective(String lineCode, String workStation, String materialCode) {
        List<WmsMaterialBinding> list = wmsMaterialBindingMapper.selectList(Wrappers.<WmsMaterialBinding>lambdaQuery()
                .eq(WmsMaterialBinding::getBindStatus, STATUS_ENABLED)
                .eq(WmsMaterialBinding::getMaterialCode, materialCode)
                .and(StringUtils.hasText(lineCode) || StringUtils.hasText(workStation), w -> {
                    boolean appended = false;
                    if (StringUtils.hasText(workStation)) {
                        w.eq(WmsMaterialBinding::getWorkStation, workStation);
                        appended = true;
                    }
                    if (StringUtils.hasText(lineCode)) {
                        if (appended) {
                            w.or();
                        }
                        w.eq(WmsMaterialBinding::getLineCode, lineCode);
                    }
                })
                .orderByDesc(WmsMaterialBinding::getId));
        if (list.isEmpty()) {
            return null;
        }
        if (StringUtils.hasText(workStation)) {
            for (WmsMaterialBinding binding : list) {
                if (workStation.equals(binding.getWorkStation())) {
                    return binding;
                }
            }
        }
        if (StringUtils.hasText(lineCode)) {
            for (WmsMaterialBinding binding : list) {
                if (lineCode.equals(binding.getLineCode())) {
                    return binding;
                }
            }
        }
        return list.get(0);
    }

    public WmsMaterialBinding requireBinding(Long id) {
        WmsMaterialBinding binding = wmsMaterialBindingMapper.selectById(id);
        if (binding == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "防混料绑定不存在: " + id);
        }
        return binding;
    }

    public Long create(WmsBindingSaveRequest request) {
        WmsMaterialBinding binding = new WmsMaterialBinding();
        binding.setBindingNo(wmsSupportService.nextNo(NO_PREFIX));
        applyRequest(binding, request);
        wmsMaterialBindingMapper.insert(binding);
        return binding.getId();
    }

    public void update(Long id, WmsBindingSaveRequest request) {
        WmsMaterialBinding binding = requireBinding(id);
        applyRequest(binding, request);
        wmsMaterialBindingMapper.updateById(binding);
    }

    public void delete(Long id) {
        requireBinding(id);
        wmsMaterialBindingMapper.deleteById(id);
    }

    private void applyRequest(WmsMaterialBinding binding, WmsBindingSaveRequest request) {
        binding.setBindType(request.getBindType());
        binding.setLineCode(request.getLineCode());
        binding.setWorkStation(request.getWorkStation());
        binding.setMaterialCode(request.getMaterialCode());
        binding.setBatchNo(request.getBatchNo());
        binding.setContainerCode(request.getContainerCode());
        binding.setEffectiveFrom(request.getEffectiveFrom());
        binding.setEffectiveTo(request.getEffectiveTo());
        binding.setBindStatus(StringUtils.hasText(request.getBindStatus())
                ? request.getBindStatus() : STATUS_ENABLED);
        binding.setRemark(request.getRemark());
    }
}
