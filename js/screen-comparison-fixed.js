/**
 * 简化版 Screen Size Comparison Tool
 */

console.log('Simplified screen comparison script loaded!');

// 等待页面加载完成
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in simplified script');

    // 常量
    var CM_PER_INCH = 2.54;
    var currentUnit = 'inches';
    var lastCalculatedDisplay1 = null;
    var lastCalculatedDisplay2 = null;

    // 获取必要的DOM元素
    var compareBtn = document.getElementById('compare-btn');
    var comparisonResults = document.getElementById('comparison-results');
    var aspect1Select = document.getElementById('aspect1-select');
    var aspect2Select = document.getElementById('aspect2-select');
    var customRatio1 = document.getElementById('custom-ratio1');
    var customRatio2 = document.getElementById('custom-ratio2');
    var customWidth1 = document.getElementById('custom-width1');
    var customHeight1 = document.getElementById('custom-height1');
    var customWidth2 = document.getElementById('custom-width2');
    var customHeight2 = document.getElementById('custom-height2');
    var size1Input = document.getElementById('size1-input');
    var size2Input = document.getElementById('size2-input');
    var unit1Select = document.getElementById('unit1-select');
    var unit2Select = document.getElementById('unit2-select');
    var unitInches = document.getElementById('unit-inches');
    var unitCm = document.getElementById('unit-cm');
    var comparisonTitle = document.getElementById('comparison-title');
    var comparisonVisual = document.getElementById('comparison-visual');

    // 表格元素
    var display1Header = document.getElementById('display1-header');
    var display2Header = document.getElementById('display2-header');
    var comparison1Header = document.getElementById('comparison1-header');
    var comparison2Header = document.getElementById('comparison2-header');
    var width1Cell = document.getElementById('width1');
    var width2Cell = document.getElementById('width2');
    var height1Cell = document.getElementById('height1');
    var height2Cell = document.getElementById('height2');
    var area1Cell = document.getElementById('area1');
    var area2Cell = document.getElementById('area2');
    var as4x3_1Cell = document.getElementById('as-4x3-1');
    var as4x3_2Cell = document.getElementById('as-4x3-2');
    var as16x9_1Cell = document.getElementById('as-16x9-1');
    var as16x9_2Cell = document.getElementById('as-16x9-2');
    var as235x1_1Cell = document.getElementById('as-235x1-1');
    var as235x1_2Cell = document.getElementById('as-235x1-2');
    var compActual1Cell = document.getElementById('comp-actual1');
    var compActual2Cell = document.getElementById('comp-actual2');
    var comp4x3_1Cell = document.getElementById('comp-4x3-1');
    var comp4x3_2Cell = document.getElementById('comp-4x3-2');
    var comp16x9_1Cell = document.getElementById('comp-16x9-1');
    var comp16x9_2Cell = document.getElementById('comp-16x9-2');
    var comp235x1_1Cell = document.getElementById('comp-235x1-1');
    var comp235x1_2Cell = document.getElementById('comp-235x1-2');

    console.log('Compare button in simplified script:', compareBtn);

    // 处理"Other"选项的显示/隐藏
    if (aspect1Select) {
        aspect1Select.addEventListener('change', function() {
            if (this.value === 'custom' && customRatio1) {
                customRatio1.style.display = 'flex';
            } else if (customRatio1) {
                customRatio1.style.display = 'none';
            }
        });
    }

    if (aspect2Select) {
        aspect2Select.addEventListener('change', function() {
            if (this.value === 'custom' && customRatio2) {
                customRatio2.style.display = 'flex';
            } else if (customRatio2) {
                customRatio2.style.display = 'none';
            }
        });
    }

    // 单位切换事件
    if (unitInches) {
        unitInches.addEventListener('click', function() {
            switchUnit('inches');
        });
    }

    if (unitCm) {
        unitCm.addEventListener('click', function() {
            switchUnit('cm');
        });
    }

    // 同步单位选择器变化
    if (unit1Select && unit2Select) {
        unit1Select.addEventListener('change', function() {
            unit2Select.value = unit1Select.value;
        });

        unit2Select.addEventListener('change', function() {
            unit1Select.value = unit2Select.value;
        });
    }

    // 比较按钮点击事件
    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            console.log('Compare button clicked in simplified script');
            compareDisplays();
        });
    }
    
    // 窗口大小变化时更新可视化
    window.addEventListener('resize', debounce(function() {
        if (lastCalculatedDisplay1 && lastCalculatedDisplay2) {
            // 重新计算表格和可视化，适应新的窗口大小
            updateTables(lastCalculatedDisplay1, lastCalculatedDisplay2, 
                        calculateComparison(lastCalculatedDisplay1, lastCalculatedDisplay2));
            updateTitle(
                lastCalculatedDisplay1.diagonal, 
                lastCalculatedDisplay1.aspectRatio, 
                lastCalculatedDisplay2.diagonal, 
                lastCalculatedDisplay2.aspectRatio, 
                currentUnit
            );
            updateVisual(lastCalculatedDisplay1, lastCalculatedDisplay2);
        }
    }, 250));

    // 切换单位（英寸/厘米）
    function switchUnit(unit) {
        currentUnit = unit;

        // 更新UI
        if (unit === 'inches') {
            unitInches.classList.add('active');
            unitCm.classList.remove('active');
        } else {
            unitInches.classList.remove('active');
            unitCm.classList.add('active');
        }

        // 如果已有比较结果，重新计算
        if (comparisonResults.classList.contains('visible')) {
            compareDisplays();
        }
    }

    // 比较两个显示器
    function compareDisplays() {
        if (comparisonResults) {
            comparisonResults.classList.add('visible');
        }

        // 获取显示器1的信息
        var aspect1 = getAspectRatio(aspect1Select.value, customWidth1.value, customHeight1.value);
        var size1 = parseFloat(size1Input.value) || 52;
        var unit1 = unit1Select.value;

        // 获取显示器2的信息
        var aspect2 = getAspectRatio(aspect2Select.value, customWidth2.value, customHeight2.value);
        var size2 = parseFloat(size2Input.value) || 56;
        var unit2 = unit2Select.value;

        // 统一单位为英寸进行计算
        var size1Inches = unit1 === 'cm' ? size1 / CM_PER_INCH : size1;
        var size2Inches = unit2 === 'cm' ? size2 / CM_PER_INCH : size2;

        // 计算详细尺寸
        var display1 = calculateDisplayDimensions(size1Inches, aspect1);
        var display2 = calculateDisplayDimensions(size2Inches, aspect2);
        
        // 保存计算结果，用于窗口大小变化时更新
        lastCalculatedDisplay1 = display1;
        lastCalculatedDisplay2 = display2;

        // 计算不同宽高比下的对角线尺寸
        display1.as4x3 = calculateDiagonalForAspect(display1.area, { width: 4, height: 3 });
        display1.as16x9 = calculateDiagonalForAspect(display1.area, { width: 16, height: 9 });
        display1.as235x1 = calculateDiagonalForAspect(display1.area, { width: 2.35, height: 1 });

        display2.as4x3 = calculateDiagonalForAspect(display2.area, { width: 4, height: 3 });
        display2.as16x9 = calculateDiagonalForAspect(display2.area, { width: 16, height: 9 });
        display2.as235x1 = calculateDiagonalForAspect(display2.area, { width: 2.35, height: 1 });

        // 计算对比差异百分比
        var comparison = calculateComparison(display1, display2);

        // 更新标题
        updateTitle(size1, aspect1, size2, aspect2, unit1);

        // 更新表格
        updateTables(display1, display2, comparison);

        // 更新可视化
        updateVisual(display1, display2);
    }
    
    // debounce函数，防止窗口大小变化时频繁更新
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // 获取本地化文本
    function getLocalizedText(key, defaultText) {
        // 检查是否存在i18next库和translate函数
        if (window.i18next && typeof window.i18next.t === 'function') {
            return window.i18next.t(key) || defaultText;
        }
        return defaultText;
    }

    // 获取宽高比
    function getAspectRatio(aspectValue, customWidth, customHeight) {
        if (aspectValue === 'custom') {
            return {
                width: parseFloat(customWidth) || 16,
                height: parseFloat(customHeight) || 9
            };
        }

        switch (aspectValue) {
            case '16x9':
                return { width: 16, height: 9 };
            case '16x10':
                return { width: 16, height: 10 };
            case '2.35x1':
                return { width: 2.35, height: 1 };
            case '21x9':
                return { width: 21, height: 9 };
            case '32x9':
                return { width: 32, height: 9 };
            case '4x3':
                return { width: 4, height: 3 };
            case '3x2':
                return { width: 3, height: 2 };
            case '5x3':
                return { width: 5, height: 3 };
            case '5x4':
                return { width: 5, height: 4 };
            case '1x1':
                return { width: 1, height: 1 };
            default:
                return { width: 16, height: 9 };
        }
    }

    // 计算显示器尺寸
    function calculateDisplayDimensions(diagonal, aspectRatio) {
        var ratio = aspectRatio.width / aspectRatio.height;
        var height = Math.sqrt((diagonal * diagonal) / (1 + ratio * ratio));
        var width = height * ratio;
        var area = width * height;

        return {
            diagonal: diagonal,
            width: width,
            height: height,
            area: area,
            aspectRatio: aspectRatio
        };
    }

    // 计算特定宽高比的对角线尺寸（基于相同面积）
    function calculateDiagonalForAspect(area, aspectRatio) {
        var ratio = aspectRatio.width / aspectRatio.height;
        var height = Math.sqrt(area / ratio);
        var width = height * ratio;
        return Math.sqrt(width * width + height * height);
    }

    // 计算两个显示器的对比数据
    function calculateComparison(display1, display2) {
        // 计算实际对比
        var diagonalDiff = ((display2.diagonal - display1.diagonal) / display1.diagonal) * 100;
        var areaDiff = ((display2.area - display1.area) / display1.area) * 100;

        // 计算4:3对比
        var diagonal4x3Diff = ((display2.as4x3 - display1.as4x3) / display1.as4x3) * 100;
        var area4x3Diff = (((display2.as4x3 * display2.as4x3) - (display1.as4x3 * display1.as4x3)) / (display1.as4x3 * display1.as4x3)) * 100;

        // 计算16:9对比
        var diagonal16x9Diff = ((display2.as16x9 - display1.as16x9) / display1.as16x9) * 100;
        var area16x9Diff = (((display2.as16x9 * display2.as16x9) - (display1.as16x9 * display1.as16x9)) / (display1.as16x9 * display1.as16x9)) * 100;

        // 计算2.35:1对比
        var diagonal235x1Diff = ((display2.as235x1 - display1.as235x1) / display1.as235x1) * 100;
        var area235x1Diff = (((display2.as235x1 * display2.as235x1) - (display1.as235x1 * display1.as235x1)) / (display1.as235x1 * display1.as235x1)) * 100;

        return {
            actual: {
                diagonalDiff: diagonalDiff,
                areaDiff: areaDiff
            },
            as4x3: {
                diagonalDiff: diagonal4x3Diff,
                areaDiff: area4x3Diff
            },
            as16x9: {
                diagonalDiff: diagonal16x9Diff,
                areaDiff: area16x9Diff
            },
            as235x1: {
                diagonalDiff: diagonal235x1Diff,
                areaDiff: area235x1Diff
            }
        };
    }

    // 更新标题
    function updateTitle(size1, aspect1, size2, aspect2, unit) {
        var unitText = unit === 'cm' ? 'cm' : 'inch';
        var isMobile = window.innerWidth < 768;

        // 格式化宽高比显示
        var aspect1Text = formatAspectRatioText(aspect1);
        var aspect2Text = formatAspectRatioText(aspect2);

        var displayWord = getLocalizedText('display', 'display');
        var vsWord = getLocalizedText('vs', 'vs');
        
        var title;
        
        // 在移动设备上使用更简洁的标题格式
        if (isMobile) {
            title = size1 + '" ' + aspect1Text + ' ' + vsWord + ' ' + size2 + '" ' + aspect2Text;
        } else {
            title = size1 + ' ' + unitText + ' ' + aspect1Text + ' ' + displayWord + ' ' + 
                   vsWord + ' ' + size2 + ' ' + unitText + ' ' + aspect2Text + ' ' + displayWord;
        }
        
        comparisonTitle.textContent = title;

        // 更新表头 - 保持简洁的表头格式
        var header1 = isMobile ? (size1 + '" ' + aspect1Text) : (size1 + ' ' + unitText + ' ' + aspect1Text);
        var header2 = isMobile ? (size2 + '" ' + aspect2Text) : (size2 + ' ' + unitText + ' ' + aspect2Text);
        
        display1Header.textContent = header1;
        display2Header.textContent = header2;
        comparison1Header.textContent = header1;
        comparison2Header.textContent = header2;
    }

    // 格式化宽高比文本
    function formatAspectRatioText(aspectRatio) {
        if (aspectRatio.width === 2.35 && aspectRatio.height === 1) {
            return '2.35:1';
        }
        return aspectRatio.width + 'x' + aspectRatio.height;
    }

    // 更新表格
    function updateTables(display1, display2, comparison) {
        // 设置当前单位
        var unit = currentUnit;
        var unitSuffix = unit === 'inches' ? ' inches' : ' cm';
        var areaSuffix = unit === 'inches' ? ' inches²' : ' cm²';
        
        // 检测是否为移动设备
        var isMobile = window.innerWidth < 768;
        
        // 移动设备下使用简化的单位后缀
        if (isMobile) {
            unitSuffix = unit === 'inches' ? '″' : ' cm';
            areaSuffix = unit === 'inches' ? '″²' : ' cm²';
        }

        // 转换数值到当前单位
        var width1Value = formatNumber(unit === 'cm' ? display1.width * CM_PER_INCH : display1.width);
        var width2Value = formatNumber(unit === 'cm' ? display2.width * CM_PER_INCH : display2.width);
        var height1Value = formatNumber(unit === 'cm' ? display1.height * CM_PER_INCH : display1.height);
        var height2Value = formatNumber(unit === 'cm' ? display2.height * CM_PER_INCH : display2.height);
        var area1Value = formatNumber(unit === 'cm' ? display1.area * CM_PER_INCH * CM_PER_INCH : display1.area);
        var area2Value = formatNumber(unit === 'cm' ? display2.area * CM_PER_INCH * CM_PER_INCH : display2.area);

        // 转换等效对角线尺寸
        var as4x3_1Value = formatNumber(unit === 'cm' ? display1.as4x3 * CM_PER_INCH : display1.as4x3);
        var as4x3_2Value = formatNumber(unit === 'cm' ? display2.as4x3 * CM_PER_INCH : display2.as4x3);
        var as16x9_1Value = formatNumber(unit === 'cm' ? display1.as16x9 * CM_PER_INCH : display1.as16x9);
        var as16x9_2Value = formatNumber(unit === 'cm' ? display2.as16x9 * CM_PER_INCH : display2.as16x9);
        var as235x1_1Value = formatNumber(unit === 'cm' ? display1.as235x1 * CM_PER_INCH : display1.as235x1);
        var as235x1_2Value = formatNumber(unit === 'cm' ? display2.as235x1 * CM_PER_INCH : display2.as235x1);

        // 更新基本尺寸表格
        width1Cell.textContent = width1Value + unitSuffix;
        width2Cell.textContent = width2Value + unitSuffix;
        height1Cell.textContent = height1Value + unitSuffix;
        height2Cell.textContent = height2Value + unitSuffix;
        area1Cell.textContent = area1Value + areaSuffix;
        area2Cell.textContent = area2Value + areaSuffix;
        as4x3_1Cell.textContent = as4x3_1Value + unitSuffix;
        as4x3_2Cell.textContent = as4x3_2Value + unitSuffix;
        as16x9_1Cell.textContent = as16x9_1Value + unitSuffix;
        as16x9_2Cell.textContent = as16x9_2Value + unitSuffix;
        as235x1_1Cell.textContent = as235x1_1Value + unitSuffix;
        as235x1_2Cell.textContent = as235x1_2Value + unitSuffix;

        // 更新对比表格
        // 实际比例下的对比
        var actualCompText1 = formatComparison(comparison.actual.diagonalDiff, comparison.actual.areaDiff, false, isMobile);
        var actualCompText2 = formatComparison(comparison.actual.diagonalDiff, comparison.actual.areaDiff, true, isMobile);
        compActual1Cell.innerHTML = actualCompText1;
        compActual2Cell.innerHTML = actualCompText2;

        // 4:3比例下的对比
        var comp4x3Text1 = formatComparison(comparison.as4x3.diagonalDiff, comparison.as4x3.areaDiff, false, isMobile);
        var comp4x3Text2 = formatComparison(comparison.as4x3.diagonalDiff, comparison.as4x3.areaDiff, true, isMobile);
        comp4x3_1Cell.innerHTML = comp4x3Text1;
        comp4x3_2Cell.innerHTML = comp4x3Text2;

        // 16:9比例下的对比
        var comp16x9Text1 = formatComparison(comparison.as16x9.diagonalDiff, comparison.as16x9.areaDiff, false, isMobile);
        var comp16x9Text2 = formatComparison(comparison.as16x9.diagonalDiff, comparison.as16x9.areaDiff, true, isMobile);
        comp16x9_1Cell.innerHTML = comp16x9Text1;
        comp16x9_2Cell.innerHTML = comp16x9Text2;

        // 2.35:1比例下的对比
        var comp235x1Text1 = formatComparison(comparison.as235x1.diagonalDiff, comparison.as235x1.areaDiff, false, isMobile);
        var comp235x1Text2 = formatComparison(comparison.as235x1.diagonalDiff, comparison.as235x1.areaDiff, true, isMobile);
        comp235x1_1Cell.innerHTML = comp235x1Text1;
        comp235x1_2Cell.innerHTML = comp235x1Text2;
    }

    // 格式化比较文本
    function formatComparison(diagonalDiff, areaDiff, isSecond, isMobile) {
        // 反转第一个设备的值，使其显示为比第二个设备小/大
        if (!isSecond) {
            diagonalDiff = -diagonalDiff;
            areaDiff = -areaDiff;
        }
        
        // 获取本地化文本
        var largerDiagonalText = getLocalizedText('larger_diagonal', 'larger diagonal');
        var smallerDiagonalText = getLocalizedText('smaller_diagonal', 'smaller diagonal');
        var largerAreaText = getLocalizedText('larger_area', 'larger area');
        var smallerAreaText = getLocalizedText('smaller_area', 'smaller area');
        
        // 在移动设备上使用更简洁的文本
        if (isMobile) {
            largerDiagonalText = getLocalizedText('larger', '↑');
            smallerDiagonalText = getLocalizedText('smaller', '↓');
            largerAreaText = getLocalizedText('larger', '↑');
            smallerAreaText = getLocalizedText('smaller', '↓');
        }

        var diagonalText = diagonalDiff >= 0 ?
            formatNumber(diagonalDiff) + '% ' + largerDiagonalText :
            formatNumber(-diagonalDiff) + '% ' + smallerDiagonalText;

        var areaText = areaDiff >= 0 ?
            formatNumber(areaDiff) + '% ' + largerAreaText :
            formatNumber(-areaDiff) + '% ' + smallerAreaText;

        // 添加高亮类
        var diagonalClass = Math.abs(diagonalDiff) > 10 ? 'highlight' : '';
        var areaClass = Math.abs(areaDiff) > 20 ? 'highlight' : '';
        
        // 在移动设备上可能使用单行显示
        if (isMobile) {
            return '<span class="' + diagonalClass + '">' + diagonalText + '</span><br>' +
                   '<span class="' + areaClass + '">' + areaText + '</span>';
        } else {
            return '<span class="' + diagonalClass + '">' + diagonalText + '</span><br>' +
                   '<span class="' + areaClass + '">' + areaText + '</span>';
        }
    }

    // 格式化数字，保留两位小数
    function formatNumber(number) {
        // 检测是否为移动设备
        var isMobile = window.innerWidth < 768;
        
        // 移动设备下，尽量减少小数位数
        if (isMobile) {
            // 如果数字大于10，只保留一位小数
            if (number >= 10) {
                return parseFloat(number.toFixed(1));
            }
            // 如果数字小于10但大于1，保留一位小数
            else if (number >= 1) {
                return parseFloat(number.toFixed(1));
            }
            // 极小的数值保留两位小数
            else {
                return parseFloat(number.toFixed(2));
            }
        }
        
        // 桌面设备保持两位小数
        return parseFloat(number.toFixed(2));
    }

    // 更新可视化
    function updateVisual(display1, display2) {
        // 获取容器尺寸
        var containerWidth = comparisonVisual.clientWidth;
        var containerHeight = comparisonVisual.clientHeight;

        // 清除旧内容
        while (comparisonVisual.firstChild) {
            comparisonVisual.removeChild(comparisonVisual.firstChild);
        }
        
        // 创建Canvas元素
        var canvas = document.createElement('canvas');
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        comparisonVisual.appendChild(canvas);
        
        var ctx = canvas.getContext('2d');
        
        // 找出两个显示器中较大的尺寸，用于缩放
        var maxWidth = Math.max(display1.width, display2.width);
        var maxHeight = Math.max(display1.height, display2.height);

        // 计算缩放因子（保持宽高比）
        var scaleFactorWidth = (containerWidth * 0.8) / maxWidth;
        var scaleFactorHeight = (containerHeight * 0.8) / maxHeight;
        var scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);

        // 计算缩放后的尺寸
        var scaledWidth1 = display1.width * scaleFactor;
        var scaledHeight1 = display1.height * scaleFactor;
        var scaledWidth2 = display2.width * scaleFactor;
        var scaledHeight2 = display2.height * scaleFactor;

        // 计算位置（居中）
        var left1 = (containerWidth - scaledWidth1) / 2;
        var top1 = (containerHeight - scaledHeight1) / 2;
        var left2 = (containerWidth - scaledWidth2) / 2;
        var top2 = (containerHeight - scaledHeight2) / 2;

        // 绘制显示器2（底层）
        ctx.fillStyle = 'rgba(60, 179, 113, 0.4)';  // 淡绿色
        ctx.strokeStyle = 'rgba(60, 179, 113, 0.8)';
        ctx.lineWidth = 2;
        ctx.fillRect(left2, top2, scaledWidth2, scaledHeight2);
        ctx.strokeRect(left2, top2, scaledWidth2, scaledHeight2);
        
        // 绘制显示器1（上层）
        ctx.fillStyle = 'rgba(70, 130, 180, 0.4)';  // 淡蓝色
        ctx.strokeStyle = 'rgba(70, 130, 180, 0.8)';
        ctx.fillRect(left1, top1, scaledWidth1, scaledHeight1);
        ctx.strokeRect(left1, top1, scaledWidth1, scaledHeight1);
        
        // 绘制尺寸信息 - 显示器1
        var unit = currentUnit === 'inches' ? 'in' : 'cm';
        var width1Text = formatNumber(currentUnit === 'inches' ? display1.width : display1.width * CM_PER_INCH) + unit;
        var height1Text = formatNumber(currentUnit === 'inches' ? display1.height : display1.height * CM_PER_INCH) + unit;
        
        ctx.fillStyle = 'rgba(70, 130, 180, 1)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        // 宽度标注
        ctx.fillText(width1Text, left1 + scaledWidth1/2, top1 - 5);
        // 高度标注
        ctx.save();
        ctx.translate(left1 - 5, top1 + scaledHeight1/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(height1Text, 0, 0);
        ctx.restore();
        
        // 绘制尺寸信息 - 显示器2
        var width2Text = formatNumber(currentUnit === 'inches' ? display2.width : display2.width * CM_PER_INCH) + unit;
        var height2Text = formatNumber(currentUnit === 'inches' ? display2.height : display2.height * CM_PER_INCH) + unit;
        
        ctx.fillStyle = 'rgba(60, 179, 113, 1)';
        // 宽度标注
        ctx.fillText(width2Text, left2 + scaledWidth2/2, top2 + scaledHeight2 + 15);
        // 高度标注
        ctx.save();
        ctx.translate(left2 + scaledWidth2 + 15, top2 + scaledHeight2/2);
        ctx.rotate(Math.PI/2);
        ctx.fillText(height2Text, 0, 0);
        ctx.restore();
        
        // 添加图例
        var legendX = 10;
        var legendY = 20;
        var legendSize = 15;
        
        // 显示器1图例
        ctx.fillStyle = 'rgba(70, 130, 180, 0.4)';
        ctx.strokeStyle = 'rgba(70, 130, 180, 0.8)';
        ctx.fillRect(legendX, legendY, legendSize, legendSize);
        ctx.strokeRect(legendX, legendY, legendSize, legendSize);
        
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        var display1Name = display1Header.textContent || getLocalizedText('display_1', 'Display 1');
        ctx.fillText(display1Name, legendX + legendSize + 5, legendY + legendSize - 2);
        
        // 显示器2图例
        legendY += legendSize + 10;
        ctx.fillStyle = 'rgba(60, 179, 113, 0.4)';
        ctx.strokeStyle = 'rgba(60, 179, 113, 0.8)';
        ctx.fillRect(legendX, legendY, legendSize, legendSize);
        ctx.strokeRect(legendX, legendY, legendSize, legendSize);
        
        ctx.fillStyle = '#000';
        var display2Name = display2Header.textContent || getLocalizedText('display_2', 'Display 2');
        ctx.fillText(display2Name, legendX + legendSize + 5, legendY + legendSize - 2);
        
        // 添加对角线尺寸信息
        var diag1Text = formatNumber(currentUnit === 'inches' ? display1.diagonal : display1.diagonal * CM_PER_INCH) + unit;
        var diag2Text = formatNumber(currentUnit === 'inches' ? display2.diagonal : display2.diagonal * CM_PER_INCH) + unit;
        
        var diagonalLabel = getLocalizedText('diagonal', 'diagonal');
        
        // 绘制对角线 - 显示器1
        ctx.strokeStyle = 'rgba(70, 130, 180, 0.6)';
        ctx.beginPath();
        ctx.moveTo(left1, top1);
        ctx.lineTo(left1 + scaledWidth1, top1 + scaledHeight1);
        ctx.stroke();
        
        // 对角线文字
        ctx.fillStyle = 'rgba(70, 130, 180, 1)';
        ctx.save();
        var angle = Math.atan2(scaledHeight1, scaledWidth1);
        ctx.translate(left1 + scaledWidth1/2, top1 + scaledHeight1/2);
        ctx.rotate(angle);
        ctx.fillText(diag1Text + ' ' + diagonalLabel, 0, -5);
        ctx.restore();
        
        // 绘制对角线 - 显示器2
        ctx.strokeStyle = 'rgba(60, 179, 113, 0.6)';
        ctx.beginPath();
        ctx.moveTo(left2, top2);
        ctx.lineTo(left2 + scaledWidth2, top2 + scaledHeight2);
        ctx.stroke();
        
        // 对角线文字
        ctx.fillStyle = 'rgba(60, 179, 113, 1)';
        ctx.save();
        var angle = Math.atan2(scaledHeight2, scaledWidth2);
        ctx.translate(left2 + scaledWidth2/2, top2 + scaledHeight2/2);
        ctx.rotate(angle);
        ctx.fillText(diag2Text + ' ' + diagonalLabel, 0, 15);
        ctx.restore();
    }

    // 初始化时尝试自动比较
    setTimeout(function() {
        if (aspect1Select.value && aspect2Select.value && size1Input.value && size2Input.value) {
            compareDisplays();
        }
    }, 500);
});
