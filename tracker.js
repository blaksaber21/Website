    (function () {
        var API = 'https://api.owenpinard.com';

        fetch(API + '/ip/info')
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(populate)
            .catch(function () {
                document.getElementById('trackerLoading').innerHTML =
                    '<span class="mono" style="color:var(--overlay2)">failed to load data</span>';
            });

        function setText(id, val) {
            var el = document.getElementById(id);
            if (el && val != null) el.textContent = val;
        }

        function showRow(rowId, valId, val) {
            if (!val) return;
            setText(valId, val);
            document.getElementById(rowId).style.display = '';
        }

        function flagNode(code, name) {
            var frag = document.createDocumentFragment();
            if (code && /^[a-zA-Z]{2}(-[a-zA-Z0-9]+)?$/.test(code)) {
                var img = document.createElement('img');
                img.src = 'https://flagcdn.com/w20/' + code.toLowerCase() + '.png';
                img.className = 'flag';
                img.alt = code.toUpperCase();
                frag.appendChild(img);
            }
            frag.appendChild(document.createTextNode(name || '—'));
            return frag;
        }

        function populate(d) {
            document.getElementById('trackerLoading').style.display = 'none';
            document.getElementById('trackerContent').style.display = '';

            setText('tVtype', d.visitor_type || 'Unknown Visitor');
            setText('tIp', d.ip);
            setText('tUa', d.ua);

            if (d.rdns) showRow('row-rdns', 'tRdns', d.rdns);

            var orgName   = (d.company && d.company.name)   || (d.network && d.network.name)   || null;
            var orgDomain = (d.company && d.company.domain) || (d.network && d.network.domain) || null;
            if (orgName) {
                var orgEl = document.getElementById('tOrg');
                orgEl.textContent = '';
                if (orgDomain) {
                    var orgFav = document.createElement('img');
                    orgFav.src = 'https://www.google.com/s2/favicons?domain=' + orgDomain + '&sz=32';
                    orgFav.className = 'fav';
                    orgFav.alt = '';
                    var orgLink = document.createElement('a');
                    orgLink.href = 'https://' + orgDomain;
                    orgLink.target = '_blank';
                    orgLink.rel = 'noopener noreferrer';
                    orgLink.textContent = orgName;
                    orgEl.appendChild(orgFav);
                    orgEl.appendChild(orgLink);
                } else {
                    orgEl.textContent = orgName;
                }
                document.getElementById('row-org').style.display = '';
            }

            if (d.asn && d.asn.number) {
                var asnEl = document.getElementById('tAsn');
                asnEl.textContent = '';
                if (d.asn.domain) {
                    var asnFav = document.createElement('img');
                    asnFav.src = 'https://www.google.com/s2/favicons?domain=' + d.asn.domain + '&sz=32';
                    asnFav.className = 'fav';
                    asnFav.alt = '';
                    asnEl.appendChild(asnFav);
                }
                asnEl.appendChild(document.createTextNode('AS' + d.asn.number));
                if (d.asn.domain) {
                    asnEl.appendChild(document.createTextNode(' ('));
                    var asnLink = document.createElement('a');
                    asnLink.href = 'https://' + d.asn.domain;
                    asnLink.target = '_blank';
                    asnLink.rel = 'noopener noreferrer';
                    asnLink.textContent = d.asn.domain;
                    asnEl.appendChild(asnLink);
                    asnEl.appendChild(document.createTextNode(')'));
                }
                document.getElementById('row-asn').style.display = '';
            }

            if (d.carrier) showRow('row-carrier', 'tCarrier', d.carrier);

            if (d.pop && d.pop.city) {
                setText('tPop', d.pop.city + ', ' + d.pop.country + ' (' + d.pop.iata + ')');
                document.getElementById('sec-pop').style.display = '';
            }

            var ipr = d.ip_registry_guess || {};
            var cf  = d.cf_guess || {};

            setText('loc-ip-city', ipr.city || '—');
            setText('loc-cf-city', cf.city || '—');

            var ipRegionEl = document.getElementById('loc-ip-region');
            var cfRegionEl = document.getElementById('loc-cf-region');
            if (ipRegionEl) { ipRegionEl.textContent = ''; ipRegionEl.appendChild(flagNode(ipr.region_flag, ipr.region)); }
            if (cfRegionEl) { cfRegionEl.textContent = ''; cfRegionEl.appendChild(flagNode(cf.region_flag, cf.region)); }

            var ipCountryEl = document.getElementById('loc-ip-country');
            var cfCountryEl = document.getElementById('loc-cf-country');
            if (ipCountryEl) { ipCountryEl.textContent = ''; ipCountryEl.appendChild(flagNode(ipr.country_code, ipr.country)); }
            if (cfCountryEl) { cfCountryEl.textContent = ''; cfCountryEl.appendChild(flagNode(cf.country_code, cf.country)); }

            if (ipr.lat != null && ipr.lon != null)
                setText('loc-ip-coords', ipr.lat.toFixed(4) + ', ' + ipr.lon.toFixed(4));
            if (cf.lat != null && cf.lon != null)
                setText('loc-cf-coords', cf.lat.toFixed(4) + ', ' + cf.lon.toFixed(4));

            var tags = (d.sec_tags || []).concat(d.type_tags || []);
            if (tags.length) {
                var tagsEl = document.getElementById('tTags');
                (d.sec_tags || []).forEach(function (t) {
                    var s = document.createElement('span');
                    s.className = 't-tag danger';
                    s.textContent = t;
                    tagsEl.appendChild(s);
                });
                (d.type_tags || []).forEach(function (t) {
                    var s = document.createElement('span');
                    s.className = 't-tag';
                    s.textContent = t;
                    tagsEl.appendChild(s);
                });
                document.getElementById('sec-tags').style.display = '';
            }

            detectClient(d.dns_uid);
        }

        function detectClient(dnsUid) {
            setText('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
            setText('ss', screen.width + ' \xd7 ' + screen.height +
                          ' (' + screen.availWidth + ' \xd7 ' + screen.availHeight + ')');

            var adbEl = document.getElementById('adb');
            if (adbEl) {
                adbEl.textContent = 'True';
                fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { cache: 'no-store' })
                    .then(function (r) {
                        return r.text().then(function (t) {
                            adbEl.textContent = t.length > 10000 ? 'False' : 'True';
                        });
                    })
                    .catch(function () {});
            }

            function showDetail(sectionId, id, val) {
                if (val == null || val === '') return;
                var el = document.getElementById(id);
                if (!el) return;
                el.textContent = val;
                el.parentElement.style.display = '';
                document.getElementById(sectionId).style.display = '';
            }

            function showHw(id, val) { showDetail('sec-hw', id, val); }

            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                var ext = gl.getExtension('WEBGL_debug_renderer_info');
                if (ext) {
                    showHw('gpu', gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
                    showHw('gpu-vendor', gl.getParameter(ext.UNMASKED_VENDOR_WEBGL));
                }
            }

            showHw('cpu-cores', navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' logical' : null);
            showHw('mem', navigator.deviceMemory ? navigator.deviceMemory + ' GB (approx)' : null);

            var mq = window.matchMedia;
            if (mq) {
                var ptr = mq('(pointer: coarse)').matches ? 'Touchscreen'
                        : mq('(pointer: fine)').matches
                            ? (navigator.maxTouchPoints > 0 ? 'Trackpad' : 'Mouse')
                            : null;
                showHw('pointer', ptr);
            }

            if (navigator.getBattery) {
                navigator.getBattery().then(function (b) {
                    showHw('battery', Math.round(b.level * 100) + '%' + (b.charging ? ' (charging)' : ''));
                }).catch(function () {});
            }

            if (navigator.userAgentData) {
                navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness']).then(function (d) {
                    showHw('cpu-arch', [d.architecture, d.bitness ? d.bitness + '-bit' : ''].filter(Boolean).join(' '));
                }).catch(function () {});
            }

            function fpHash(s) {
                var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
                for (var i = 0; i < s.length; i++) {
                    var ch = s.charCodeAt(i);
                    h1 = Math.imul(h1 ^ ch, 2654435761);
                    h2 = Math.imul(h2 ^ ch, 1597334677);
                }
                h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
                h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
                return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
            }
            try {
                var actx = new OfflineAudioContext(1, 44100, 44100);
                var osc = actx.createOscillator();
                var cmp = actx.createDynamicsCompressor();
                osc.type = 'triangle';
                osc.frequency.value = 10000;
                cmp.threshold.value = -50; cmp.knee.value = 40; cmp.ratio.value = 12;
                cmp.attack.value = 0; cmp.release.value = 0.25;
                osc.connect(cmp); cmp.connect(actx.destination); osc.start(0);
                actx.startRendering().then(function (buf) {
                    var data = buf.getChannelData(0), sum = 0;
                    for (var i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
                    showHw('audio-fp', fpHash(sum.toFixed(15)));
                }).catch(function () {});
            } catch (e) {}

            var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                showDetail('net-sec', 'net-type', conn.effectiveType);
                showDetail('net-sec', 'net-dl', conn.downlink != null ? conn.downlink + ' Mbps' : null);
                showDetail('net-sec', 'net-rtt', conn.rtt != null ? conn.rtt + ' ms' : null);
            }

            var img6 = new Image();
            var t = setTimeout(function () { img6.src = ''; done(false); }, 3000);

            var fired = false;
            function done(ok) {
            if (fired) return;
            fired = true;
            clearTimeout(t);
            var el = document.getElementById('ipv6-support');
            if (el) { el.textContent = ok ? 'True' : 'False'; el.style.color = ''; }
            }
            img6.onload = function () { done(true); };
            img6.onerror = function () { done(false); };
            img6.src = 'https://ipv6.google.com/favicon.ico?' + Date.now();

            if (!dnsUid) return;
            var dnsSec    = document.getElementById('dns-sec');
            var dnsStatus = document.getElementById('dns-status');
            var dnsList   = document.getElementById('dns-list');
            dnsSec.style.display = '';

            var img = new Image();
            img.onload = img.onerror = function () {
                fetch(API + '/ip/dns-results?uid=' + dnsUid)
                    .then(function (r) { return r.json(); })
                    .then(renderDns)
                    .catch(function () { dnsStatus.style.display = 'none'; });
            };
            img.src = 'https://' + dnsUid + '.test.dnsleaktest.com/';

            function renderDns(servers) {
                dnsStatus.style.display = 'none';
                if (!Array.isArray(servers) || servers.length === 0) return;
                servers.forEach(function (s, i) {
                    if (i > 0) {
                        var hr = document.createElement('div');
                        hr.className = 'dns-divider';
                        dnsList.appendChild(hr);
                    }
                    function dnsRow(label, inner) {
                        var row  = document.createElement('div'); row.className = 't-row';
                        var lbl  = document.createElement('span'); lbl.className = 't-lbl'; lbl.textContent = label;
                        var val  = document.createElement('span'); val.className = 't-val';
                        if (typeof inner === 'string') val.textContent = inner;
                        else val.appendChild(inner);
                        row.appendChild(lbl); row.appendChild(val); dnsList.appendChild(row);
                    }
                    var ipEl = document.createElement('span');
                    ipEl.className = 'mono'; ipEl.textContent = s.ip_address || '';
                    dnsRow('IP', ipEl);
                    if (s.hostname) {
                        var hEl = document.createElement('span');
                        hEl.className = 'mono'; hEl.style.fontSize = '.76rem'; hEl.textContent = s.hostname;
                        dnsRow('Hostname', hEl);
                    }
                    if (s.isp) dnsRow('Host', flagNode(s.country_code, s.isp));
                });
            }
        }
    })();
