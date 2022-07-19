import pandas as pd


def log(filename):
    with open(filename, 'rb') as f:
        log_text = f.read().decode('utf-8')

    log_list_org = log_text.split('\r\n')

    log_list = list(filter(lambda x: x[4:6] != '本场', log_list_org))

    log_list = list(filter(lambda x: x != '', log_list))

    log_list = list(filter(lambda x: x != 'log', log_list))

    log_list = list(filter(lambda x: x[0:4] != '分数统计', log_list))

    i = len(log_list) - 1

    while i >= 0:
        if log_list[i] == '撤回':
            log_list.pop(i)
            log_list.pop(i-1)
            i -= 2
        else:
            i -= 1

    dianpao_list = list(filter(lambda x: '点炮' in x, log_list))

    result_list = []
    for i in dianpao_list:
        pao = i[0:i.index('点炮')-1]
        rong = i[i.index('点炮')+4:i.index('得到')-1]
        point = i[i.index('得到')+3:i.index('0 点')+1]
        result_list.append([pao, rong, point])

    df = pd.DataFrame(result_list)
    df.to_excel('result.xlsx')
