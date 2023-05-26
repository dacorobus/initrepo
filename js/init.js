var myNameSpace = myNameSpace || {};
        (function (ns) {
            let characters = [];
            let activeCharacter = [];
            let activeCharacterIndex = 0;

            function guid() {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }

            function makeInt(value) {
                return Number(value) !== NaN ? parseInt(value) : 0;
            }



            function person(data) {
                function hitsPenaltyFn(hitsTotal, hitsTaken) {
                    if (hitsTotal > 0) {
                        const rat = Math.floor((hitsTaken / hitsTotal) * 100);
                        if (rat >= 75) return -30;
                        if (rat >= 50) return -20;
                        if (rat >= 25) return -10;
                        return 0;
                    }
                    return 0;
                };

                function addPenalty(hitsPenalty, addtnlPenalty) {
                    return hitsPenalty + addtnlPenalty;
                };

                function calcAttackTotal(totalPenalty, attackRoll){
                    return totalPenalty + attackRoll;
                };

                this.name = data?.name || '';
                this.init = data?.init ? makeInt(data.init) : 0;
                this.rndOfStun = data?.rndofstun ? makeInt(data.rndofstun) : 0;
                this.rndNoParry = data?.rndnoparry ? makeInt(data.rndnoparry) : 0;
                this.rndMustParry = data?.rndmustparry ? makeInt(data.rndmustparry) : 0;
                this.bleedPerRnd = data?.bleedperrnd ? makeInt(data.bleedperrnd) : 0;
                this.hitsTotal = data?.hitstotal ? makeInt(data.hitstotal) : 0;
                this.hitsTaken = data?.hitstaken ? makeInt(data.hitstaken) : 0;
                this.hitsPenalty = hitsPenaltyFn(this.hitsTotal, this.hitsTaken);
                this.addtnlPenalty = data?.addtnlpenalty ? makeInt(data.addtnlpenalty) : 0;
                this.totalPenalty = addPenalty(this.hitsPenalty, this.addtnlPenalty);
                this.armorType = data?.armortype ? makeInt(data.armortype) : 0;
                this.defenceBonus = data?.defencebonus ? makeInt(data.defencebonus) : 0;
                this.offenceBonus = data?.offencebonus ? makeInt(data.offencebonus) : 0;
                this.attackRoll = data?.attackroll ? makeInt(data.attackroll) : 0;
                this.attackTotal = () => {
                    return calcAttackTotal(this.attackRoll,calcAttackTotal(this.offenceBonus, this.totalPenalty));
                }
                this.autoRoll = data?.autoroll || false;
                this.guid = data?.guid || guid();
            }

            function waitForElement(id) {
                let elem = document.getElementById(id);
                if (elem) {
                    initApp();
                } else {
                    setTimeout(function () {
                        waitForElement(id);
                    }, 100);
                }
            };

            function arrSort(a, b) {
                if (a.init > b.init) return -1;
                if (a.init < b.init) return 1;
                return 0;
            }

            function clearAddUpdate() {
                const elems = document.querySelectorAll('#addupdatecontainer input');
                elems.forEach((item) => {
                    if (item.type === "checkbox") item.checked = false;
                    if (item.type === "text") item.value = '';
                    if (item.type === "number") item.value = 0;
                });
            }

            function updateLocalStorage(){
                const ls = localStorage;
                if(ls.hasOwnProperty("initrepo")){
                    ls.setItem("initrepo",JSON.stringify(characters));
                }else{
                    console.log('adding initrepo');
                    ls.setItem("initrepo","repo has been created");
                }
            };

            function addToCharacters(character) {
                if (characters.length === 0) {
                    characters.push(character);
                } else {
                    let tempArr = characters.filter((item) => {
                        return item.guid !== character.guid;
                    });
                    tempArr.push(character);
                    if (tempArr.length > 1) {
                        tempArr.sort(arrSort);
                    }
                    characters = tempArr.map((item) => item);
                }
                updateLocalStorage();

            };

            function addUpdate() {
                const nameElem = document.getElementById('init-name');
                if (nameElem.value === '') {
                    alert("a character must contain a name");
                } else {
                    const elems = document.querySelectorAll('#addupdatecontainer input');
                    const d = {};
                    elems.forEach((item) => {
                        if (item.type === 'checkbox') {
                            d[item.id.split('-')[1]] = item.checked;
                        } else {
                            d[item.id.split('-')[1]] = item.value;
                        }
                    });
                    addToCharacters(new person(d));
                }
                clearAddUpdate();
                updateList();
            };

            function removeItem() {
                const nameElem = document.getElementById('init-guid');
                if(nameElem.value !== ''){
                    const items = characters.filter((item) => {
                        return item.guid !== nameElem.value;
                    });
                    characters = items.map(item => item);
                    clearAddUpdate();
                    updateList();
                }
            }

            function copyItem(){
                const elem = document.getElementById('init-guid');
                if(elem.value !== ''){
                    elem.value = guid();
                    addUpdate();
                }
            }

            function rowElement(labelText, dataText) {
                let div = document.createElement('div');
                if(labelText){
                    let label = document.createElement('span');
                        label.innerText = labelText;
                    let name = document.createElement('span');
                    name.innerText = dataText;
                    name.classList.add('make-bold');
                    div.append(label);
                    div.append(name);
                } 
                return div;
            }

            function createDiv (){
                const div = document.createElement('div');
                if(arguments.length > 0){
                    const args = Array.from(arguments);
                    args.forEach(item => {
                        div.append(item);
                    });
                }
                return div;
            };

            function createRow(rowData) {
                let row = document.createElement('div');
                row.classList.add('inittable');
                row.classList.add('datarow');
                if (!rowData.autoRoll) {
                    row.classList.add('autoroll-highlight');
                    if (rowData.init === -999) {
                        row.classList.add('remove-row');
                    }
                }
                row.dataset.guid = rowData.guid;
                row.append(createDiv(rowElement('Name:', rowData.name),rowElement('Initiative:', rowData.init)));
                row.append(createDiv(rowElement('Rnds Of Stun:', rowData.rndOfStun),
                    rowElement('Rnds No Parry:', rowData.rndNoParry),
                    rowElement('Rnds Must Parry:', rowData.rndMustParry)));
                row.append(createDiv(rowElement('Bleed Per Rnd:', rowData.bleedPerRnd),
                    rowElement('Hits Total:', rowData.hitsTotal),
                    rowElement('Hits Taken:', rowData.hitsTaken)));
                row.append(createDiv(rowElement('Hits Penalty:', rowData.hitsPenalty),
                    rowElement('Addtional Penalty:', rowData.addtnlPenalty),
                    rowElement('Total Penalty:', rowData.totalPenalty)));
                row.append(createDiv(rowElement('Armor Type:', rowData.armorType),
                    rowElement('Defence Bonus:', rowData.defenceBonus)));
                row.append(createDiv(rowElement('Offence Bonus:',rowData.offenceBonus),
                    rowElement('Attack Roll:', rowData.attackRoll),
                    rowElement('Attack Total:', rowData.attackTotal())));
                return row;
            };

            function updateList() {
                const listContainer = document.getElementById('initcontainer');
                listContainer.innerHTML = '';
                characters.forEach((item) => {
                    listContainer.append(createRow(item));
                });
            };

            function rollInit(bonus = 0, isAttack) {

                let roll = Math.floor(Math.random() * 100) + 1;
                if (roll > 95) {
                    return rollInit(roll + bonus);
                }
                return bonus + roll;
            };

            function showActive () {
                if(activeCharacter.length > 0 && (activeCharacterIndex + 1) <= activeCharacter.length){
                    setActiveCharacter(activeCharacterIndex);
                    activeCharacterIndex++;
                } 
            }

            function setActiveCharacter(index){
                const elems = document.querySelectorAll('.datarow');
                const elemsArr = Array.from(elems);
                console.log(elemsArr[index].getBoundingClientRect());
                const rowClientRect = elemsArr[index].getBoundingClientRect();
                const elem = document.getElementById('next-init-container');
                const topAdjust = Math.floor(rowClientRect.height / 4);
                const leftAdjust = Math.floor(rowClientRect.left / 4);
                elem.style.top = (rowClientRect.top + topAdjust) + "px";
                elem.style.left = leftAdjust + "px";
                

            }

            function initApp() {
                const addUpdateBtn = document.getElementById('button-add-update');
                addUpdateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    addUpdate();
                });

                const nextInitBtn = document.getElementById('button-next');
                nextInitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const arr = characters.filter((item) => {
                        return item.autoRoll;
                    });
                    const updateInit = arr.map((item) => {
                        item.init = rollInit(0);
                        item.attackRoll = rollInit(0);
                        return item;
                    });
                    updateInit.forEach((item) => {
                        addToCharacters(item);
                    });
                    const noAutoArray = characters.filter((item) => {
                        return !item.autoRoll;
                    });
                    const updateNoAuto = noAutoArray.map((item) => {
                        item.init = 99999;
                        return item;
                    });
                    updateNoAuto.forEach((item) => {
                        addToCharacters(item);
                    });

                    activeCharacter = characters.map(item => item);

                    updateList();
                    activeCharacterIndex = 0;
                    showActive();
                });

                const initContainer = document.getElementById('initcontainer');
                initContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const dataRow = e.target.closest('.datarow');
                    const guid = dataRow.dataset.guid;
                    const editRow = document.querySelectorAll('#addupdatecontainer input');
                    const characterArr = characters.filter((item) => {
                        return item.guid === guid;
                    });
                    const character = characterArr[0];
                    const keysToLowerCase = (Object.keys(character)).map(item => item.toLowerCase());
                    const keys = Object.keys(character);
                    editRow.forEach((elem) => {
                        const item = elem.id.split('-')[1];
                        if (item === 'autoroll') {
                            if ((character.autoRoll && !elem.checked) || (!character.autoRoll && elem.checked))
                                elem.click();
                        } else {
                            keysToLowerCase.findIndex(keyValue => keyValue === item.toLowerCase()) !== -1 ? elem.value = character[keys[keysToLowerCase.findIndex(keyValue => keyValue === item.toLowerCase())]] : elem.value = 0;
                        }
                    });
                });

                const btnRemove = document.getElementById('button-remove');
                btnRemove.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    removeItem(); 
                });

                const btnCopy = document.getElementById('button-copy');
                btnCopy.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    copyItem();
                });

                const btnShowActive = document.getElementById('button-showactive');
                btnShowActive.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    showActive();
                })

                // localstorage
                const ls = localStorage;
                if(ls.hasOwnProperty("initrepo")){
                    const lsCharacters = JSON.parse(ls.getItem("initrepo"));
                    characters = lsCharacters.map(item => {
                        const keys = Object.keys(item);
                        let obj = {};
                        keys.forEach(key => {
                            obj[key.toLowerCase()] = item[key];
                        });
                        return new person(obj);
                    });
                    updateList();
                }


            }

            ns.waitForElement = waitForElement;
        })(myNameSpace);

        myNameSpace.waitForElement('button-next');