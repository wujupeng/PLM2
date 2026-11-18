package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntGoliveExecuteRequest;
import com.huaweicloud.plm.system.dto.IntGoliveRecordQuery;
import com.huaweicloud.plm.system.dto.IntGoliveRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntGoliveRecord;
import com.huaweicloud.plm.system.mapper.IntGoliveRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 上线切换记录服务（N9，DEV-104）。 */
@Service
@RequiredArgsConstructor
public class IntGoliveService {

    private static final String DEFAULT_CUTOVER_STATUS = "PLANNED";
    private static final String STATUS_ROLLED_BACK = "ROLLED_BACK";
    private static final String NO_PREFIX = "GO";

    private final IntGoliveRecordMapper intGoliveRecordMapper;
    private final IntSupportService intSupport;

    /** 分页查询上线切换记录。 */
    public PageResult<IntGoliveRecord> page(IntGoliveRecordQuery query) {
        Page<IntGoliveRecord> page = query.toPage();
        intGoliveRecordMapper.selectPage(page, Wrappers.<IntGoliveRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getGoliveNo()), IntGoliveRecord::getGoliveNo, query.getGoliveNo())
                .eq(StringUtils.hasText(query.getCutoverStatus()), IntGoliveRecord::getCutoverStatus, query.getCutoverStatus())
                .eq(StringUtils.hasText(query.getOwner()), IntGoliveRecord::getOwner, query.getOwner())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntGoliveRecord::getGoliveNo, query.getKeyword()).or()
                        .like(IntGoliveRecord::getPlanName, query.getKeyword()).or()
                        .like(IntGoliveRecord::getOwner, query.getKeyword()))
                .orderByDesc(IntGoliveRecord::getId));
        return PageResult.of(page);
    }

    /** 按编号获取上线切换记录，不存在则抛出业务异常。 */
    public IntGoliveRecord require(String goliveNo) {
        IntGoliveRecord record = intGoliveRecordMapper.selectOne(Wrappers.<IntGoliveRecord>lambdaQuery()
                .eq(IntGoliveRecord::getGoliveNo, goliveNo)
                .last("LIMIT 1"));
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "上线切换记录不存在: " + goliveNo);
        }
        return record;
    }

    /** 创建上线切换记录，返回上线编号。 */
    public String create(IntGoliveRecordSaveRequest request) {
        IntGoliveRecord record = new IntGoliveRecord();
        record.setGoliveNo(StringUtils.hasText(request.getGoliveNo())
                ? request.getGoliveNo() : intSupport.nextNo(NO_PREFIX));
        record.setPlanName(request.getPlanName());
        record.setScope(request.getScope());
        record.setPlannedAt(request.getPlannedAt());
        record.setCutoverStatus(DEFAULT_CUTOVER_STATUS);
        record.setRollbackPlan(request.getRollbackPlan());
        record.setOwner(StringUtils.hasText(request.getOwner())
                ? request.getOwner() : UserContext.getUsername());
        record.setRemark(request.getRemark());
        intGoliveRecordMapper.insert(record);
        return record.getGoliveNo();
    }

    /** 更新上线切换记录。 */
    public void update(String goliveNo, IntGoliveRecordSaveRequest request) {
        IntGoliveRecord record = require(goliveNo);
        if (StringUtils.hasText(request.getGoliveNo())) {
            record.setGoliveNo(request.getGoliveNo());
        }
        record.setPlanName(request.getPlanName());
        record.setScope(request.getScope());
        if (request.getPlannedAt() != null) {
            record.setPlannedAt(request.getPlannedAt());
        }
        record.setRollbackPlan(request.getRollbackPlan());
        record.setOwner(request.getOwner());
        record.setRemark(request.getRemark());
        intGoliveRecordMapper.updateById(record);
    }

    /** 删除上线切换记录。 */
    public void delete(String goliveNo) {
        IntGoliveRecord record = require(goliveNo);
        intGoliveRecordMapper.deleteById(record.getId());
    }

    /** 执行上线切换，返回更新后的实体。 */
    public IntGoliveRecord execute(String goliveNo, IntGoliveExecuteRequest request) {
        IntGoliveRecord record = require(goliveNo);
        record.setCutoverStatus(request.getCutoverStatus());
        if (STATUS_ROLLED_BACK.equals(request.getCutoverStatus())) {
            record.setRollbackAt(LocalDateTime.now());
        } else {
            record.setActualAt(LocalDateTime.now());
        }
        intGoliveRecordMapper.updateById(record);
        return record;
    }
}
