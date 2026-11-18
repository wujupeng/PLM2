package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SpecHarnessDetailResponse;
import com.huaweicloud.plm.system.dto.SpecHarnessQuery;
import com.huaweicloud.plm.system.dto.SpecHarnessSaveRequest;
import com.huaweicloud.plm.system.dto.SpecHarnessTerminalSaveRequest;
import com.huaweicloud.plm.system.entity.SpecHarness;
import com.huaweicloud.plm.system.entity.SpecHarnessTerminal;
import com.huaweicloud.plm.system.mapper.SpecHarnessMapper;
import com.huaweicloud.plm.system.mapper.SpecHarnessTerminalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 附件线束端子服务（DEV-044）。
 */
@Service
@RequiredArgsConstructor
public class HarnessService {

    private static final String DEFAULT_STATUS = "draft";
    private static final String STATUS_RELEASED = "released";

    private final SpecHarnessMapper harnessMapper;
    private final SpecHarnessTerminalMapper terminalMapper;

    public PageResult<SpecHarness> page(SpecHarnessQuery query) {
        Page<SpecHarness> page = query.toPage();
        harnessMapper.selectPage(page, Wrappers.<SpecHarness>lambdaQuery()
                .eq(StringUtils.hasText(query.getHarnessCode()), SpecHarness::getHarnessCode, query.getHarnessCode())
                .eq(StringUtils.hasText(query.getProductCode()), SpecHarness::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), SpecHarness::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getStatus()), SpecHarness::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SpecHarness::getHarnessCode, query.getKeyword()).or()
                        .like(SpecHarness::getHarnessName, query.getKeyword()))
                .orderByDesc(SpecHarness::getCreatedAt));
        return PageResult.of(page);
    }

    public SpecHarnessDetailResponse detail(Long harnessId) {
        SpecHarness harness = requireHarness(harnessId);
        SpecHarnessDetailResponse response = new SpecHarnessDetailResponse();
        response.setHarness(harness);
        response.setTerminals(listTerminals(harnessId));
        return response;
    }

    public List<SpecHarness> listByMaterial(String materialCode) {
        return harnessMapper.selectList(Wrappers.<SpecHarness>lambdaQuery()
                .eq(SpecHarness::getMaterialCode, materialCode)
                .orderByAsc(SpecHarness::getId));
    }

    public List<SpecHarnessTerminal> listTerminals(Long harnessId) {
        return terminalMapper.selectList(Wrappers.<SpecHarnessTerminal>lambdaQuery()
                .eq(SpecHarnessTerminal::getHarnessId, harnessId)
                .orderByAsc(SpecHarnessTerminal::getSeqNo)
                .orderByAsc(SpecHarnessTerminal::getId));
    }

    @Transactional
    public Long create(SpecHarnessSaveRequest request) {
        if (harnessMapper.countByCode(request.getHarnessCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "线束编码已存在: " + request.getHarnessCode());
        }
        SpecHarness harness = new SpecHarness();
        applyRequest(harness, request);
        harnessMapper.insert(harness);
        saveTerminals(harness.getId(), request.getTerminals());
        return harness.getId();
    }

    @Transactional
    public void update(Long harnessId, SpecHarnessSaveRequest request) {
        SpecHarness harness = requireHarness(harnessId);
        if (!harness.getHarnessCode().equals(request.getHarnessCode())
                && harnessMapper.countByCode(request.getHarnessCode(), harnessId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "线束编码已存在: " + request.getHarnessCode());
        }
        boolean released = STATUS_RELEASED.equals(harness.getStatus());
        if (released && !CollectionUtils.isEmpty(request.getTerminals())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布线束不允许修改端子明细");
        }
        applyRequest(harness, request);
        harnessMapper.updateById(harness);
        if (!released) {
            replaceTerminals(harnessId, request.getTerminals());
        }
    }

    @Transactional
    public void delete(Long harnessId) {
        requireHarness(harnessId);
        terminalMapper.delete(Wrappers.<SpecHarnessTerminal>lambdaQuery()
                .eq(SpecHarnessTerminal::getHarnessId, harnessId));
        harnessMapper.deleteById(harnessId);
    }

    @Transactional
    public void release(Long harnessId) {
        SpecHarness harness = requireHarness(harnessId);
        long terminalCount = terminalMapper.selectCount(Wrappers.<SpecHarnessTerminal>lambdaQuery()
                .eq(SpecHarnessTerminal::getHarnessId, harnessId));
        if (terminalCount == 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "线束至少需要 1 条端子明细才能发布");
        }
        harness.setStatus(STATUS_RELEASED);
        harnessMapper.updateById(harness);
    }

    private void applyRequest(SpecHarness harness, SpecHarnessSaveRequest request) {
        harness.setHarnessCode(request.getHarnessCode());
        harness.setHarnessName(request.getHarnessName());
        harness.setProductCode(request.getProductCode());
        harness.setMaterialCode(request.getMaterialCode());
        harness.setBomHeaderId(request.getBomHeaderId());
        harness.setBomCode(request.getBomCode());
        harness.setBomPosition(request.getBomPosition());
        harness.setDocNo(request.getDocNo());
        harness.setTotalLength(request.getTotalLength());
        harness.setConnectorQty(request.getConnectorQty());
        harness.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus()
                : (harness.getStatus() == null ? DEFAULT_STATUS : harness.getStatus()));
        harness.setDescription(request.getDescription());
        harness.setRemark(request.getRemark());
    }

    private void saveTerminals(Long harnessId, List<SpecHarnessTerminalSaveRequest> requests) {
        if (CollectionUtils.isEmpty(requests)) {
            return;
        }
        int seq = 1;
        for (SpecHarnessTerminalSaveRequest request : requests) {
            SpecHarnessTerminal terminal = new SpecHarnessTerminal();
            terminal.setHarnessId(harnessId);
            terminal.setSeqNo(request.getSeqNo() == null ? seq : request.getSeqNo());
            applyTerminal(terminal, request);
            terminalMapper.insert(terminal);
            seq++;
        }
    }

    private void replaceTerminals(Long harnessId, List<SpecHarnessTerminalSaveRequest> requests) {
        terminalMapper.delete(Wrappers.<SpecHarnessTerminal>lambdaQuery()
                .eq(SpecHarnessTerminal::getHarnessId, harnessId));
        saveTerminals(harnessId, requests);
    }

    private void applyTerminal(SpecHarnessTerminal terminal, SpecHarnessTerminalSaveRequest request) {
        terminal.setWireMaterialCode(request.getWireMaterialCode());
        terminal.setWireSpec(request.getWireSpec());
        terminal.setWireColor(request.getWireColor());
        terminal.setWireLength(request.getWireLength());
        terminal.setTerminalMaterialCode(request.getTerminalMaterialCode());
        terminal.setTerminalName(request.getTerminalName());
        terminal.setSheathMaterialCode(request.getSheathMaterialCode());
        terminal.setSheathName(request.getSheathName());
        terminal.setFromConnector(request.getFromConnector());
        terminal.setFromPin(request.getFromPin());
        terminal.setToConnector(request.getToConnector());
        terminal.setToPin(request.getToPin());
        terminal.setAssembleRequirement(request.getAssembleRequirement());
        terminal.setRemark(request.getRemark());
    }

    private SpecHarness requireHarness(Long harnessId) {
        SpecHarness harness = harnessMapper.selectById(harnessId);
        if (harness == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "线束不存在: " + harnessId);
        }
        return harness;
    }
}
