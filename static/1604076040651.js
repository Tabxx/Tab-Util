/**
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
*/
var twoSum = function (nums, target) {
    let result = [];

    for (let i = 0; i < nums.length; i++) {
        let index = nums.findIndex((cur, idx) => cur === target - nums[i] && idx !== i);
        if (index > -1) {
            result = [i, index];
            break;
        }
    }
    return result;
};


/**
给定数组 nums = [-1, 0, 1, 2, -1, -4]，

满足要求的三元组集合为：
[
  [-1, 0, 1],
  [-1, -1, 2]
]
*/
var threeSum = function (nums) {
    let len = nums.length;
    if (len < 3) return [];

    let result = [];

    // 先排序，减少双指针循环次数
    nums.sort((a, b) => a - b);

    for (let i = 0; i < len; i++) {
        // 按从小到大排序循环，当前基准数如果大于0，表明之后的所有数都大于0，三数相加不可能再等于0了
        if (nums[i] > 0) break;
        // 当前基准数和前一个基准数相等时， 会造成重复的情况
        if (i > 0 && nums[i] === nums[i - 1]) continue;

        let left = i + 1;
        let right = len - 1;

        while (left < right) {
            let sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                // 左指针过滤掉相同元素
                while (left < right && nums[left] === nums[left + 1]) left++;
                // 右指针过滤掉相同元素
                while (left < right && nums[right] === nums[right - 1]) right--;
                // 已经匹配到a+b+c=0; 双指针都移动一位
                left++;
                right--;
            } else if (sum > 0) {
                right--
            } else {
                left++;
            }
        }
    }
    return result;
};

// console.log(threeSum([-1, 0, 1, 2, -1, -4]))


/**
 * 给定一个包含了一些 0 和 1 的非空二维数组 grid 。
一个 岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 
必须在水平或者竖直方向上相邻。你可以假设 grid 的四个边缘都被 0（代表水）包围着。
找到给定的二维数组中最大的岛屿面积。(如果没有岛屿，则返回面积为 0 。)
 */
var maxAreaOfIsland = function (grid) {
    let height = grid.length;
    let width = grid[0].length;
    let max = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] === 1) {
                max = Math.max(max, dfs(grid, i, j, height, width));
            }
        }
    }

    return max;
};

var dfs = function (grid, i, j, height, width) {
    if (i < 0 || j < 0 || i >= height || j >= width || grid[i][j] === 0) return 0;

    grid[i][j] = 0;
    let count = 1;
    count += dfs(grid, i - 1, j, height, width);
    count += dfs(grid, i + 1, j, height, width);
    count += dfs(grid, i, j - 1, height, width);
    count += dfs(grid, i, j + 1, height, width);
    return count;
}
// maxAreaOfIsland([[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
// [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
// [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
// [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
// [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]])
// console.log(maxAreaOfIsland([
//     [0, 1, 0],
//     [1, 1, 1],
//     [0, 1, 0]
// ]))


/**
 * 给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从0开始)。如果不存在，则返回  -1。
 */
var strStr = function (haystack, needle) {
    let haystack_len = haystack.length;
    let needle_len = needle.length;
    // 空字符串返回0
    if (needle_len === 0) return 0;

    for (let i = 0; i < haystack_len - needle_len + 1; i++) {
        let count = 0;
        for (let j = 0; j < needle_len; j++) {
            if (haystack[i + j] != needle[j]) {
                break;
            }
            count++;
        }
        if (count >= needle_len) {
            return i
        }
    }
    return -1;
};

// console.log(strStr('aaaaa', 'bba'))

/**
 * 给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。
 */

var subsets = function (nums) {
    /**
     * backtrak(可选列表, 路径)
     * if（满足条件） return
     * for(i 可选列表)
     * 1. 添加路径path.push(nums[i])
     * 2. 添加结果result.push(path)
     * 3. 递归
     * 4. 撤回路径
     */
    let result = [[]];
    nums = nums.sort((a, b) => a - b);
    const backtrack = (index, path) => {
        if (path.length === nums.length) return;

        for (let i = index; i < nums.length; i++) {
            // 1.添加路径
            path.push(nums[i]);
            // 2. 添加结果
            result.push(path.concat());
            // 3. 递归
            backtrack(i + 1, path);
            // 撤回路径
            path.pop();
        }
    }

    backtrack(0, [])

    return result;
};

console.log(subsets([1, 2, 3]))