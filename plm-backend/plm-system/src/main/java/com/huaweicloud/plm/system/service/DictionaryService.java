package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.DictionaryQuery;
import com.huaweicloud.plm.system.dto.DictionarySaveRequest;
import com.huaweicloud.plm.system.entity.SysDictionary;
import com.huaweicloud.plm.system.mapper.SysDictionaryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final SysDictionaryMapper dictionaryMapper;

    public PageResult<SysDictionary> page(DictionaryQuery query) {
        Page<SysDictionary> page = query.toPage();
        dictionaryMapper.selectPage(page, Wrappers.<SysDictionary>lambdaQuery()
                .eq(StringUtils.hasText(query.getDictType()), SysDictionary::getDictType, query.getDictType())
                .eq(query.getStatus() != null, SysDictionary::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysDictionary::getDictLabel, query.getKeyword()).or()
                        .like(SysDictionary::getDictValue, query.getKeyword()))
                .orderByAsc(SysDictionary::getDictType)
                .orderByAsc(SysDictionary::getSortNo));
        return PageResult.of(page);
    }

    public List<SysDictionary> listByType(String dictType) {
        if (!StringUtils.hasText(dictType)) {
            throw new BusinessException("字典类型不能为空");
        }
        return dictionaryMapper.selectList(Wrappers.<SysDictionary>lambdaQuery()
                .eq(SysDictionary::getDictType, dictType)
                .eq(SysDictionary::getStatus, 1)
                .orderByAsc(SysDictionary::getSortNo));
    }

    public Long create(DictionarySaveRequest request) {
        ensureUnique(request.getDictType(), request.getDictValue(), -1L);
        SysDictionary dictionary = new SysDictionary();
        applyRequest(dictionary, request);
        dictionaryMapper.insert(dictionary);
        return dictionary.getId();
    }

    public void update(Long dictId, DictionarySaveRequest request) {
        SysDictionary dictionary = requireDictionary(dictId);
        ensureUnique(request.getDictType(), request.getDictValue(), dictId);
        applyRequest(dictionary, request);
        dictionaryMapper.updateById(dictionary);
    }

    public void delete(Long dictId) {
        requireDictionary(dictId);
        dictionaryMapper.deleteById(dictId);
    }

    private void applyRequest(SysDictionary dictionary, DictionarySaveRequest request) {
        dictionary.setDictType(request.getDictType());
        dictionary.setDictLabel(request.getDictLabel());
        dictionary.setDictValue(request.getDictValue());
        dictionary.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        dictionary.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        dictionary.setRemark(request.getRemark());
    }

    private void ensureUnique(String dictType, String dictValue, Long excludeId) {
        if (dictionaryMapper.countByTypeAndValue(dictType, dictValue, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "同一字典类型下字典值重复: " + dictValue);
        }
    }

    private SysDictionary requireDictionary(Long dictId) {
        SysDictionary dictionary = dictionaryMapper.selectById(dictId);
        if (dictionary == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "字典项不存在: " + dictId);
        }
        return dictionary;
    }
}
